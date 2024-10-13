import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  newsId: string;
}
