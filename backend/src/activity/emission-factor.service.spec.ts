import { InternalServerErrorException } from '@nestjs/common';
import { EmissionFactor } from '../schemas/emission-factor.schema';
import { EmissionFactorService } from './emission-factor.service';

describe('EmissionFactorService', () => {
  const resolvedFactors = {
    electricity: 0.71,
    transport_bike: 0.02,
    transport_bus: 0.08,
    transport_car: 0.12,
    transport_metro: 0.03,
    transport_walk: 0,
  };

  it('returns cached factors when available', async () => {
    const emissionFactorModel = {
      find: jest.fn(),
    };
    const redisCacheService = {
      getJson: jest.fn().mockResolvedValue(resolvedFactors),
      setJson: jest.fn(),
    };

    const service = new EmissionFactorService(
      emissionFactorModel as never,
      redisCacheService as never,
    );

    await expect(service.getEmissionFactors()).resolves.toEqual(resolvedFactors);
    expect(redisCacheService.getJson).toHaveBeenCalledTimes(1);
    expect(emissionFactorModel.find).not.toHaveBeenCalled();
    expect(redisCacheService.setJson).not.toHaveBeenCalled();
  });

  it('fetches factors from db and caches them on cache miss', async () => {
    const factorDocuments: EmissionFactor[] = [
      createFactor('electricity', 0.71),
      createFactor('transport_car', 0.12),
      createFactor('transport_bike', 0.02),
      createFactor('transport_bus', 0.08),
      createFactor('transport_metro', 0.03),
      createFactor('transport_walk', 0),
    ];
    const exec = jest.fn().mockResolvedValue(factorDocuments);
    const emissionFactorModel = {
      find: jest.fn().mockReturnValue({
        exec,
        lean: jest.fn().mockReturnThis(),
      }),
    };
    const redisCacheService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(true),
    };

    const service = new EmissionFactorService(
      emissionFactorModel as never,
      redisCacheService as never,
    );

    await expect(service.getEmissionFactors()).resolves.toEqual(resolvedFactors);
    expect(emissionFactorModel.find).toHaveBeenCalledTimes(1);
    expect(redisCacheService.setJson).toHaveBeenCalledWith(
      'emission_factors:v1',
      resolvedFactors,
      604800,
    );
  });

  it('throws EMISSION_FACTOR_NOT_FOUND when a runtime factor is missing', async () => {
    const factorDocuments: EmissionFactor[] = [
      createFactor('electricity', 0.71),
      createFactor('transport_car', 0.12),
      createFactor('transport_bike', 0.02),
      createFactor('transport_bus', 0.08),
      createFactor('transport_metro', 0.03),
    ];
    const emissionFactorModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(factorDocuments),
        lean: jest.fn().mockReturnThis(),
      }),
    };
    const redisCacheService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn(),
    };

    const service = new EmissionFactorService(
      emissionFactorModel as never,
      redisCacheService as never,
    );

    await expect(service.getEmissionFactors()).rejects.toMatchObject({
      response: {
        error: 'EMISSION_FACTOR_NOT_FOUND',
      },
    });
  });

  it('throws EMISSION_FACTOR_FETCH_FAILED when db fetch fails', async () => {
    const emissionFactorModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('db down')),
        lean: jest.fn().mockReturnThis(),
      }),
    };
    const redisCacheService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn(),
    };

    const service = new EmissionFactorService(
      emissionFactorModel as never,
      redisCacheService as never,
    );

    await expect(service.getEmissionFactors()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    await expect(service.getEmissionFactors()).rejects.toMatchObject({
      response: {
        error: 'EMISSION_FACTOR_FETCH_FAILED',
      },
    });
  });
});

function createFactor(
  type: EmissionFactor['type'],
  value: number,
): EmissionFactor {
  return {
    source: 'test',
    type,
    unit: 'kg_co2_per_unit',
    updated_at: new Date('2026-04-12T00:00:00.000Z'),
    value,
  };
}
