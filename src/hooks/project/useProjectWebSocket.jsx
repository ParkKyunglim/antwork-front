import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { update } from "lodash";

const useProjectWebSocket = ({
  userId,
  setCollaborators,
  handleAddState,
  handleEditState,
  setStates,
  handleAddItem,
}) => {
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      console.error(
        "❌ User ID is not available. WebSocket will not be initialized."
      );
      return;
    }

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws", // WebSocket 서버 URL
      reconnectDelay: 5000, // 재연결 딜레이
      heartbeatIncoming: 4000, // Heartbeat 설정 (수신)
      heartbeatOutgoing: 4000, // Heartbeat 설정 (송신)
      debug: (msg) => console.log("🔌 WebSocket Debug:", msg), // 디버그 로그
    });

    client.onConnect = () => {
      console.log("✅ WebSocket 연결 성공");
      stompClientRef.current = client;

      // 구독 설정
      const subscription = client.subscribe(
        `/topic/project/${userId}`,
        (message) => {
          try {
            const data = JSON.parse(message.body); // 메시지 파싱
            console.log("🔔 알림 메시지 수신:", JSON.stringify(data));

            // 메시지의 action에 따라 처리
            switch (data.action) {
              // 협업자 삭제
              case "collaboratorDelete":
                console.log("setCollaborators : " + setCollaborators);
                setCollaborators((prevCollaborators) => {
                  console.log("2222prevCollaborators:", prevCollaborators); // 상태 업데이트 전에 현재 상태를 찍어봄
                  const updatedCollaborators = prevCollaborators.filter(
                    (collaborator) => collaborator.id !== data.userId
                  );
                  console.log("updatedCollaborators:", updatedCollaborators); // 상태 업데이트 후 새 배열을 찍어봄
                  return updatedCollaborators;
                });
                break;
              // 작업상태 추가
              case "stateInsert":
                const newState = { ...data, items: [] };
                handleAddState(newState);
                break;
              // 작업상태 수정
              case "stateUpdate":
                const updatedState = { ...data };
                handleEditState(updatedState);
                break;
              // 작업상태 삭제
              case "stateDelete":
                setStates((prevStates) => {
                  console.log("prevStates : " + prevStates);
                  const updatedStates = prevStates.filter(
                    (state) => state.id !== data.id
                  );
                  console.log("updatedStates : " + updatedStates);
                  return updatedStates;
                });
                break;
              // 작업 추가
              case "taskInsert":
                setStates((prevStates) =>
                  prevStates.map((state) =>
                    state.id === data.id
                      ? {
                          ...state,
                          items: [...(state.items || []), ...data],
                        }
                      : state
                  )
                );
                break;
              default:
                console.warn("⚠️ 알 수 없는 액션:", data.action);
                break;
            }
          } catch (error) {
            console.error("❌ 메시지 처리 중 에러:", error);
          }
        }
      );

      console.log("📩 Subscribed to: /topic/project/" + userId);

      return () => subscription.unsubscribe();
    };

    client.onDisconnect = () => {
      console.log("🔴 WebSocket 연결 해제");
      stompClientRef.current = null;
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP Error:", frame.headers["message"], frame.body);
    };

    try {
      client.activate();
      console.log("🔌 WebSocket 활성화 중...");
    } catch (error) {
      console.error("❌ WebSocket 활성화 중 에러:", error);
    }

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [userId]);

  return stompClientRef;
};

export default useProjectWebSocket;
