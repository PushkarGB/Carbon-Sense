import { IsString } from 'class-validator';

export class CompleteTaskDto {
  @IsString()
  task_id!: string;
}
