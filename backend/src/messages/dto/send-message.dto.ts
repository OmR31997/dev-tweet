import { IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  recipientId: string;

  @IsString()
  @MaxLength(2000)
  content: string;
}
