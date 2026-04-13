import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AqiData } from '../schemas/aqi-data.schema';

const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

@Injectable()
export class AqiFetcherService {
  private readonly logger = new Logger(AqiFetcherService.name);

  constructor(
    @InjectModel('AqiData')
    private readonly aqiDataModel: Model<AqiData>,
  ) {}

  /**
   * Returns cached AQI data for the given city.
   * If the cache is stale (> 2 hours) or missing, fetches fresh data from AQICN.
   */
  async getAqiForCity(city: string): Promise<AqiData | null> {
    const slug = this.cityToSlug(city);

    const cached = await this.aqiDataModel
      .findOne({ city: slug })
      .lean()
      .exec();

    if (cached && !this.isStale(cached.fetched_at)) {
      return cached;
    }

    // Try fetching fresh data
    const fresh = await this.fetchAndStore(slug);
    return fresh ?? cached ?? null;
  }

  /**
   * Fetches AQI data from the AQICN API for a city slug and upserts into the database.
   */
  async fetchAndStore(citySlug: string): Promise<AqiData | null> {
    const token = process.env.AQICN_API_TOKEN || 'demo';
    const url = `https://api.waqi.info/feed/${encodeURIComponent(citySlug)}/?token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`AQICN API returned ${response.status} for ${citySlug}`);
        return null;
      }

      const json = await response.json();
      if (json.status !== 'ok' || !json.data) {
        this.logger.warn(`AQICN API returned non-ok status for ${citySlug}: ${json.status}`);
        return null;
      }

      const data = json.data;
      const iaqi = data.iaqi ?? {};

      const aqiDoc: Partial<AqiData> = {
        city: citySlug,
        aqi: data.aqi ?? 0,
        pm25: iaqi.pm25?.v ?? 0,
        pm10: iaqi.pm10?.v ?? 0,
        no2: iaqi.no2?.v ?? 0,
        so2: iaqi.so2?.v ?? 0,
        co: iaqi.co?.v ?? 0,
        fetched_at: new Date(),
      };

      await this.aqiDataModel.updateOne(
        { city: citySlug },
        { $set: aqiDoc },
        { upsert: true },
      );

      return aqiDoc as AqiData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch AQI for ${citySlug}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Fetch AQI for all distinct user cities. Used by the background job.
   */
  async fetchForAllCities(cities: string[]): Promise<number> {
    const slugs = [...new Set(cities.map((c) => this.cityToSlug(c)))];
    let fetched = 0;

    for (const slug of slugs) {
      const result = await this.fetchAndStore(slug);
      if (result) {
        fetched++;
      }
    }

    return fetched;
  }

  private cityToSlug(city: string): string {
    return city.trim().toLowerCase();
  }

  private isStale(fetchedAt: Date): boolean {
    return Date.now() - fetchedAt.getTime() > STALE_THRESHOLD_MS;
  }
}
