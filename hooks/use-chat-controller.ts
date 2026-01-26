import { useChatStore } from "@/store/chatStore";
import { nanoid } from "nanoid/non-secure";
import { useSendMessage } from "./use-send-message";

export const useChatController  = () => {
    const {input, setInput, addMessage, updateMessage} = useChatStore();
    const send = useSendMessage();

    const onSend = async () => {
        const trimmed = input?.trim();
        if(!trimmed || send?.isPending) return;

        setInput("");

        const userId = nanoid();
        addMessage({
            id: userId,
            role: "user",
            text: trimmed,
            createdAt: Date.now(),
            status: "sent",
        });

        const assistantId = nanoid();
        addMessage({
            id: assistantId,
            role: "assistant",
            text: "",
            createdAt: Date.now(),
            status: "sending",
        });

        try {
            const data = await send?.mutateAsync({message: trimmed});

            updateMessage(assistantId, {
                text: data?.text,
                status: "sent",
            });
        } catch (e: any) {
            updateMessage(assistantId, {
                text: "Request failed. Tap to retry.",
                status: "error",
            });
        }
    };

    return {input, setInput, onSend, isSending: send?.isPending};
};


