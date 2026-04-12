import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmissionFactor,
  EmissionFactorType,
} from '../schemas/emission-factor.schema';
import {
  EmissionFactorValues,
  REQUIRED_EMISSION_FACTOR_TYPES,
} from './activity.logic';
import { RedisCacheService } from './redis-cache.service';

const EMISSION_FACTOR_CACHE_KEY = 'emission_factors:v1';
const EMISSION_FACTOR_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class EmissionFactorService {
  constructor(
    @InjectModel('EmissionFactor')
    private readonly emissionFactorModel: Model<EmissionFactor>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async getEmissionFactors(): Promise<EmissionFactorValues> {
    const cached =
      await this.redisCacheService.getJson<EmissionFactorValues>(
        EMISSION_FACTOR_CACHE_KEY,
      );
    if (cached) {
      this.assertRequiredFactors(cached);
      return cached;
    }

    let factors: EmissionFactor[];
    try {
      factors = await this.emissionFactorModel.find().lean().exec();
    } catch {
      throw new InternalServerErrorException({
        error: 'EMISSION_FACTOR_FETCH_FAILED',
        message: 'Unable to fetch emission factors',
      });
    }

    const resolved = this.toFactorMap(factors);
    this.assertRequiredFactors(resolved);
    await this.redisCacheService.setJson(
      EMISSION_FACTOR_CACHE_KEY,
      resolved,
      EMISSION_FACTOR_CACHE_TTL_SECONDS,
    );

    return resolved;
  }

  private toFactorMap(factors: EmissionFactor[]): EmissionFactorValues {
    const resolved = {} as EmissionFactorValues;
    for (const factor of factors) {
      if (isRuntimeEmissionFactorType(factor.type)) {
        resolved[factor.type] = factor.value;
      }
    }
    return resolved;
  }

  private assertRequiredFactors(factors: EmissionFactorValues): void {
    for (const factorType of REQUIRED_EMISSION_FACTOR_TYPES) {
      if (typeof factors[factorType] !== 'number') {
        throw new InternalServerErrorException({
          error: 'EMISSION_FACTOR_NOT_FOUND',
          message: `Missing emission factor: ${factorType}`,
        });
      }
    }
  }
}

function isRuntimeEmissionFactorType(
  type: EmissionFactorType,
): type is keyof EmissionFactorValues {
  return REQUIRED_EMISSION_FACTOR_TYPES.includes(
    type as (typeof REQUIRED_EMISSION_FACTOR_TYPES)[number],
  );
}
