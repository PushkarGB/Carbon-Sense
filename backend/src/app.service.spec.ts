import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AppService } from './app.service';
import { ActivityEventsService } from './activity/activity-events.service';
import { InternalServerErrorException } from '@nestjs/common';
import * as logic from './activity/activity.logic';
import { ErrorLogService } from './resilience/error-log.service';

describe('AppService', () => {
  let service: AppService;
  let activityEventsService: jest.Mocked<ActivityEventsService>;

  const mockUserProfileModel = {
    findOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockDailyActivityLogModel = {
    exists: jest.fn(),
  };

  const mockActivityEventsService = {
    emitStreakUpdated: jest.fn(),
  };

  const mockErrorLogService = {
    logFailure: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getModelToken('UserProfile'),
          useValue: mockUserProfileModel,
        },
        {
          provide: getModelToken('DailyActivityLog'),
          useValue: mockDailyActivityLogModel,
        },
        {
          provide: ActivityEventsService,
          useValue: mockActivityEventsService,
        },
        {
          provide: ErrorLogService,
          useValue: mockErrorLogService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    activityEventsService = module.get(ActivityEventsService);

    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return Hello World!', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });

  describe('handleAppOpen', () => {
    const userId = new Types.ObjectId();
    const today = '2026-04-12';

    beforeEach(() => {
      jest.spyOn(logic, 'getDateStringInTimeZone').mockReturnValue(today);
    });

    it('should throw if missing profile', async () => {
      mockUserProfileModel.exec.mockResolvedValueOnce(null);
      await expect(service.handleAppOpen(userId)).rejects.toThrow(InternalServerErrorException);
    });

    it('should instantly return if last_streak_update is today', async () => {
      mockUserProfileModel.exec.mockResolvedValueOnce({ _id: userId, last_streak_update: today });
      const res = await service.handleAppOpen(userId);
      expect(mockUserProfileModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $inc: { 'engagement_metrics.app_open_count': 1 } }
      );
      expect(res.streak_updated).toBe(false);
      expect(mockDailyActivityLogModel.exists).not.toHaveBeenCalled();
    });

    it('should break streak to 1 if yesterday log is missing', async () => {
      mockUserProfileModel.exec.mockResolvedValueOnce({ _id: userId, last_streak_update: '2026-04-10', streak_days: 5 });
      mockDailyActivityLogModel.exists.mockResolvedValueOnce(false);
      
      const res = await service.handleAppOpen(userId);
      
      expect(mockUserProfileModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { streak_days: 1, last_streak_update: today } }
      );
      expect(res.streak_updated).toBe(true);
      expect(res.streak_days).toBe(1);
    });

    it('should increment streak if yesterday log exists', async () => {
      mockUserProfileModel.exec.mockResolvedValueOnce({ _id: userId, last_streak_update: '2026-04-11', streak_days: 5 });
      mockDailyActivityLogModel.exists.mockResolvedValueOnce(true);
      
      const res = await service.handleAppOpen(userId);
      
      expect(res.streak_days).toBe(6);
      expect(mockUserProfileModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { streak_days: 6, last_streak_update: today } }
      );
    });
  });
});
