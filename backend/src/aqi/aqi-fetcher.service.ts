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
   * Fetches AQI data from the AQICN API for a city slug (or station UID) and upserts into the database.
   */
  async fetchAndStore(slugOrUid: string, stationName?: string): Promise<AqiData | null> {
    const token = process.env.AQICN_API_TOKEN || 'demo';
    const isUid = slugOrUid.startsWith('@');
    const url = `https://api.waqi.info/feed/${encodeURIComponent(slugOrUid)}/?token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`AQICN API returned ${response.status} for ${slugOrUid}`);
        return null;
      }

      const json = await response.json();
      if (json.status !== 'ok' || !json.data) {
        this.logger.warn(`AQICN API returned non-ok status for ${slugOrUid}: ${json.status}`);
        return null;
      }

      const data = json.data;
      const iaqi = data.iaqi ?? {};

      const aqiDoc: Partial<AqiData> = {
        city: isUid ? (stationName ? this.cityToSlug(stationName) : 'unknown') : slugOrUid,
        station: stationName,
        aqi: data.aqi ?? 0,
        pm25: iaqi.pm25?.v ?? 0,
        pm10: iaqi.pm10?.v ?? 0,
        no2: iaqi.no2?.v ?? 0,
        so2: iaqi.so2?.v ?? 0,
        co: iaqi.co?.v ?? 0,
        fetched_at: new Date(),
      };

      const query = stationName ? { station: stationName } : { city: slugOrUid, station: { $exists: false } };

      await this.aqiDataModel.updateOne(
        query,
        { $set: aqiDoc },
        { upsert: true },
      );

      return aqiDoc as AqiData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch AQI for ${slugOrUid}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Returns cached AQI data for the given station.
   */
  async getAqiForStation(station: string, city: string): Promise<AqiData | null> {
    const cached = await this.aqiDataModel
      .findOne({ station })
      .lean()
      .exec();

    if (cached && !this.isStale(cached.fetched_at)) {
      return cached;
    }

    try {
      const token = process.env.AQICN_API_TOKEN || 'demo';
      // Search AQICN for the exact station name or keyword
      const searchUrl = `https://api.waqi.info/search/?token=${token}&keyword=${encodeURIComponent(station)}`;
      const searchRes = await fetch(searchUrl);
      const searchJson = await searchRes.json();

      if (searchJson.status === 'ok' && searchJson.data && searchJson.data.length > 0) {
        // Use the UID of the first search result
        const uid = searchJson.data[0].uid;
        const fresh = await this.fetchAndStore(`@${uid}`, station);
        return fresh ?? cached ?? null;
      } else {
        this.logger.warn(`Station search failed or empty for: ${station}, falling back to city: ${city}`);
        // Fallback to city
        return this.getAqiForCity(city);
      }
    } catch (e) {
      this.logger.error(`Error searching station ${station}: ${e}`);
      return this.getAqiForCity(city); // Fallback
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
