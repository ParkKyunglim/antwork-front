import axios from "axios";
import {
  PROJECT_ADD_URI,
  PROJECT_LIST_URI,
  PROJECT_DETAIL_URI,
  PROJECT_STATE_INSERT_URI,
  PROJECT_STATE_SELECT_URI,
} from "./_URI";

// 프로젝트 등록
export const postProject = async (project, uid) => {
  try {
    // 프로젝트 객체에 uid를 추가해서 전송
    const projectWithUid = { ...project, uid }; // project와 uid를 합쳐서 전송
    console.log("projectWithUid:", projectWithUid);

    // 요청 본문에 JSON 데이터 전송
    const response = await axios.post(PROJECT_ADD_URI, projectWithUid, {
      headers: {
        "Content-Type": "application/json", // JSON 형식으로 전송
      },
    });

    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("Error submitting project:", error);
    throw error;
  }
};

// 프로젝트 조회
export const getProjects = async (uid) => {
  try {
    const response = await axios.get(`${PROJECT_LIST_URI}/${uid}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Fetched Projects:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error.response || error);
    throw error;
  }
};

// 프로젝트id로 상세 조회
export const getProjectById = async (id) => {
  console.log("들어옴?");
  try {
    const response = await axios.get(`${PROJECT_DETAIL_URI}/${id}`, {
      headers: {
        "Content-Type": "application/json", // json 형식으로 보냄
      },
    });
    console.log("response.data:", response.data);
    return response.data; // 프로젝트 데이터 반환
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
};

// 프로젝트 상태 등록
export const postProjectState = async (stateData) => {
  console.log("들어옴");
  console.log("API 요청 데이터:", stateData); // 디버깅용
  try {
    const response = await axios.post(
      `${PROJECT_STATE_INSERT_URI}`,
      stateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // 서버에서 반환된 상태 DTO
  } catch (error) {
    console.error("Error adding project state:", error);
    throw error;
  }
};

// 프로젝트 상태 조회
export const getProjectStates = async (id) => {
  console.log("프로젝트상태조회 들어옴?");
  try {
    const response = await axios.get(`${PROJECT_STATE_SELECT_URI}/${id}`);
    return response.data; // 서버에서 반환된 전체 상태
  } catch (error) {
    console.error("Error fetching project states:", error);
    throw error;
  }
};
