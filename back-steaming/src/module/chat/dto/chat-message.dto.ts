export class JoinLiveRoomDto {
  liveId: string;
}

export class SendLiveMessageDto {
  liveId: string;
  senderId: string;
  senderName: string;
  message: string;
}

export class SendDirectMessageDto {
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
}
