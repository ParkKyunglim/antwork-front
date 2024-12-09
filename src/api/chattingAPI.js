import {
  CHANNEL_URI,
  CHANNEL_LIST_URI,
<<<<<<< HEAD
  DM_GET_MESSAGES_URI
} from './_URI'
=======
  DM_GET_MESSAGES_URI,
  CHANNEL_GET_URI,
  CHANNEL_GET_MESSAGES_URI,
  CHANNEL_SEND_MESSAGE_URI,
  CHANNEL_LEAVE_URI,
  CHANNEL_ADD_MEMBER_URI,
} from "./_URI";
>>>>>>> fb32f37 (채팅 채널 멤버 추가(모달))
import axios from "axios";

export const createChannel = async (channelData) => {
  try {
    console.log("channel create 요청 전송");
    // 요청 전송
    const response = await axios.post(CHANNEL_URI, channelData);

    return response.data
  } catch (error) {
    console.error("Error adding company:", error.message || error);
    throw error;
  }
}


export const getAllChannels = async () => {
  try {
    const response = await axios.get(CHANNEL_LIST_URI);
    return response.data; // 채널 목록 데이터를 반환
  } catch (error) {
    console.error("채널 목록 조회 오류:", error);
    throw error; // 에러 발생 시 다시 던져서 호출한 곳에서 처리
  }
};

<<<<<<< HEAD
=======
// 채널 멤버 추가 API 함수
export const addChannelMember = async (channelId, users) => {
  try {
    console.log(`[JS] 채널 멤버 추가 요청: 채널 ID ${channelId}`);

    // users 배열에서 ID만 추출
    const userIds = users.map((user) => user.id);

    const response = await axios.post(CHANNEL_ADD_MEMBER_URI(channelId), {
      userIds, // 서버로 ID만 전송
    });

    console.log(`[JS] 멤버 추가 성공:`, response.data);
    return response.data; // 성공 응답 반환
  } catch (error) {
    console.error(`[JS] 채널 멤버 추가 실패:`, error.message || error);
    throw error; // 에러를 호출한 곳으로 전달
  }
};
>>>>>>> fb32f37 (채팅 채널 멤버 추가(모달))

export const getDmMessages = async (dmId) => {
  try {
    const response = await axios.get(DM_GET_MESSAGES_URI(dmId));
    return response; // 데이터 반환
  } catch (error) {
    console.error("디엠 메시지 조회 실패:", error);
    throw error; // 에러 발생 시 처리
  }
};
