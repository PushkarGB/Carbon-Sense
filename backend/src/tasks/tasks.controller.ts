import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserDocumentPublic } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { EvaluateTasksDto } from './dto/evaluate-tasks.dto';
import { TasksService } from './tasks.service';

type RequestWithUser = Request & { user: UserDocumentPublic };

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('today')
  getToday(@Req() req: RequestWithUser) {
    return this.tasksService.getTodayTasks(req.user._id);
  }

  @Post('complete')
  completeTask(
    @Req() req: RequestWithUser,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.completeTask(req.user._id, dto);
  }

  @Post('evaluate')
  evaluateTasks(
    @Req() req: RequestWithUser,
    @Body() dto: EvaluateTasksDto,
  ) {
    return this.tasksService.evaluateTasks(req.user._id, dto);
  }
}
