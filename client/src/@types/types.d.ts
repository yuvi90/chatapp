export interface UserType {
  _id: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: "basic" | "admin" = "basic";
  isEmailVerified: boolean = false;
  createdAt: string;
  updatedAt: string;
}

export interface ChatListItemInterface {
  admin: string;
  createdAt: string;
  isGroupChat: true;
  lastMessage?: ChatMessageInterface;
  name: string;
  participants: UserInterface[];
  updatedAt: string;
  _id: string;
}

export interface ChatMessageInterface {
  _id: string;
  sender: Pick<UserInterface, "_id" | "avatar" | "email" | "username">;
  content: string;
  chat: string;
  attachments: {
    url: string;
    localPath: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponseType<ResponseType = unknown> {
  statusCode: number;
  status: boolean | 204;
  message: string;
  data?: ResponseType;
}

export interface ApiErrorType {
  statusCode: number;
  status: boolean;
  message: string;
}