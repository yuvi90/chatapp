import { AxiosResponse, AxiosError } from "axios";
import { ApiResponseType, ApiErrorType, UserType, ChatListItemInterface } from "../@types/types";

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className: string[]) => {
  // Filter out any empty class names and join them with a space
  return className.filter(Boolean).join(" ");
};

// Check if the code is running in a browser environment
export const isBrowser = typeof window !== "undefined";

/**
 * Handles API requests with loading, success, and error handling.
 *
 * @param {function} api - A function that returns a Promise of AxiosResponse.
 * @param {function|null} setLoading - A function to set the loading state.
 * @param {function} onSuccess - A callback function to handle successful API responses.
 * @param {function} onError - A callback function to handle API request errors.
 */
export const requestHandler = async <ResponseType>(
  api: () => Promise<AxiosResponse<ApiResponseType<ResponseType>, any>>,
  setLoading: ((loading: boolean) => void) | null,
  onSuccess: (data: ApiResponseType<ResponseType>) => void,
  onError: (error: string) => void,
) => {
  // Show loading state if setLoading function is provided
  setLoading && setLoading(true);
  try {
    // Make the API request
    const response = await api();
    const { data } = response;
    if (data?.status || response.status == 204) {
      // Call the onSuccess callback with the response data
      onSuccess(data);
    } else {
      // Throw an error if the API response is not successful
      throw new Error(data?.message || "Something went wrong!");
    }
  } catch (err) {
    console.log(err);
    let errorMessage = err instanceof Error ? err.message : "Something went wrong!";

    if (err instanceof AxiosError) {
      const axiosError = err as AxiosError<ApiErrorType>;
      if (axiosError.response) {
        const statusCode = axiosError.response.data?.statusCode;
        // Handle authentication-related errors
        if (statusCode === 401 || statusCode === 403) {
          localStorage.clear(); // Clear local storage on authentication issues
          if (isBrowser) {
            window.location.href = "/login"; // Redirect to login page
          }
        }
        errorMessage = axiosError.response.data?.message || errorMessage;
      }
    }

    onError(errorMessage);
  } finally {
    // Hide loading state if setLoading function is provided
    setLoading && setLoading(false);
  }
};

// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (
  chat: ChatListItemInterface, // The chat item for which metadata is being generated.
  loggedInUser: UserType, // The currently logged-in user details.
) => {
  // Determine the content of the last message, if any.
  // If the last message contains only attachments, indicate their count.
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
      ? `${chat.lastMessage?.attachments?.length} attachment${
          chat.lastMessage.attachments.length > 1 ? "s" : ""
        }`
      : "No messages yet"; // Placeholder text if there are no messages.

  if (chat.isGroupChat) {
    // Case: Group chat
    // Return metadata specific to group chats.
    return {
      // Default avatar for group chats.
      avatar: "https://via.placeholder.com/100x100.png",
      title: chat.name, // Group name serves as the title.
      description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender?.username + ": " + lastMessage
        : lastMessage,
    };
  } else {
    // Case: Individual chat
    // Identify the participant other than the logged-in user.
    const participant = chat.participants.find((p) => p._id !== loggedInUser?._id);
    // Return metadata specific to individual chats.
    return {
      avatar: participant?.avatar.url, // Participant's avatar URL.
      title: participant?.username, // Participant's username serves as the title.
      description: participant?.email, // Email address of the participant.
      lastMessage,
    };
  }
};

// A class that provides utility functions for working with local storage
export class LocalStorage {
  // Get a value from local storage by key
  static get(key: string) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key: string, value: any) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key: string) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}
