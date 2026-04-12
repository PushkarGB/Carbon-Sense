import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BadgeEngineService } from './badge-engine.service';
import {
  ActivityEventsService,
  TASK_EVALUATED_EVENT,
  STREAK_UPDATED_EVENT,
  EMISSION_UPDATED_EVENT,
} from '../activity/activity-events.service';

describe('BadgeEngineService', () => {
  let service: BadgeEngineService;
  let activityEventsService: jest.Mocked<ActivityEventsService>;

  const mockBadgeModel = {
    find: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockUserBadgeModel = {
    exists: jest.fn(),
    create: jest.fn(),
  };

  const mockUserProfileModel = {
    findOne: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockActivityEventsService = {
    on: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeEngineService,
        {
          provide: getModelToken('Badge'),
          useValue: mockBadgeModel,
        },
        {
          provide: getModelToken('UserBadge'),
          useValue: mockUserBadgeModel,
        },
        {
          provide: getModelToken('UserProfile'),
          useValue: mockUserProfileModel,
        },
        {
          provide: ActivityEventsService,
          useValue: mockActivityEventsService,
        },
      ],
    }).compile();

    service = module.get<BadgeEngineService>(BadgeEngineService);
    activityEventsService = module.get(ActivityEventsService);

    jest.clearAllMocks();
  });

  describe('onApplicationBootstrap', () => {
    it('should register event listeners', () => {
      service.onApplicationBootstrap();
      expect(activityEventsService.on).toHaveBeenCalledWith(TASK_EVALUATED_EVENT, expect.any(Function));
      expect(activityEventsService.on).toHaveBeenCalledWith(STREAK_UPDATED_EVENT, expect.any(Function));
      expect(activityEventsService.on).toHaveBeenCalledWith(EMISSION_UPDATED_EVENT, expect.any(Function));
    });
  });

  describe('evaluateTaskBadges', () => {
    it('should evaluate and award task badges based on threshold', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserProfileModel.exec.mockResolvedValueOnce({
        task_stats: { eco_action: 6, emission_reduction: 0, awareness: 0 },
      });

      mockBadgeModel.exec.mockResolvedValue([
        { badge_id: 'eco_5', threshold: 5 },
      ]);

      mockUserBadgeModel.exists.mockResolvedValueOnce(false);
      mockUserBadgeModel.create.mockResolvedValueOnce({});

      // Manually trigger the private method by mocking the event payload
      await (service as any).evaluateTaskBadges({ userId, date: '2026-04-12' });

      expect(mockUserBadgeModel.create).toHaveBeenCalledWith({
        user_id: new Types.ObjectId(userId),
        badge_id: 'eco_5',
        awarded_at: expect.any(Date),
      });

      // Since totalTasks = 6 >= 1, first_task should also be evaluated
      expect(mockUserBadgeModel.create).toHaveBeenCalledWith({
        user_id: new Types.ObjectId(userId),
        badge_id: 'first_task',
        awarded_at: expect.any(Date),
      });
    });

    it('should not throw if duplicate key error occurs on concurrent badge insert', async () => {
      const userId = new Types.ObjectId().toString();
      mockBadgeModel.exec.mockResolvedValue([{ badge_id: 'eco_5', threshold: 5 }]);
      mockUserBadgeModel.exists.mockResolvedValueOnce(false);
      
      const duplicateError = new Error('Duplicate');
      (duplicateError as any).code = 11000;
      mockUserBadgeModel.create.mockRejectedValueOnce(duplicateError);

      await expect(
        (service as any).awardBadgeIfEligible(new Types.ObjectId(userId), 'eco_5', 5, 6)
      ).resolves.not.toThrow();
    });
  });

  describe('evaluateStreakBadges', () => {
    it('should award perfect week and normal streak badges', async () => {
      const userId = new Types.ObjectId().toString();
      mockBadgeModel.exec.mockResolvedValue([{ badge_id: 'streak_5', threshold: 5 }]);
      mockUserBadgeModel.exists.mockResolvedValue(false);

      await (service as any).evaluateStreakBadges({ userId, date: '2026-04-12', streakDays: 8 });

      expect(mockUserBadgeModel.create).toHaveBeenCalledWith(expect.objectContaining({ badge_id: 'streak_5' }));
      expect(mockUserBadgeModel.create).toHaveBeenCalledWith(expect.objectContaining({ badge_id: 'perfect_week' }));
    });
  });

  describe('evaluatePerformanceBadges', () => {
    it('should award performance badges on emission update', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserProfileModel.exec.mockResolvedValueOnce({
        performance_metrics: { reduction_percent: 21 },
      });
      mockBadgeModel.exec.mockResolvedValue([{ badge_id: 'perf_20', threshold: 20 }]);
      mockUserBadgeModel.exists.mockResolvedValue(false);

      await (service as any).evaluatePerformanceBadges({ userId, date: '2026-04-12', reductionPercent: 21 });

      expect(mockUserBadgeModel.create).toHaveBeenCalledWith(expect.objectContaining({ badge_id: 'perf_20' }));
    });
  });
});
