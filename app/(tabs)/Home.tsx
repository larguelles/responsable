import { useChatController } from "@/hooks/use-chat-controller";
import { useChatStore } from "@/store/chatStore";
import React from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

export const Home = () => {
    const messages = useChatStore((s) => s?.messages);
    const {input, setInput, onSend, isSending} = useChatController();

    return (
        <View style={{flex: 1, padding: 12}}>
            <FlatList 
            data={messages}
            keyExtractor={(m) => m?.id}
            renderItem={({item}) => (
                <View style={{paddingVertical: 6}}>
                    <Text style={{fontWeight: "600"}}>
                        {item?.role === "user" ? "You" : "AI"}{" "}
                        {item?.status === "sending" ? "(...)" : ""}
                    </Text>
                    <Text>{item?.text}</Text>
                </View>
            )}
            />

            <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                <TextInput 
                value={input}
                onChangeText={setInput}
                placeholder="Type..."
                style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                  }}
                />
                <TouchableOpacity
                    onPress={onSend}
                    disabled={isSending}
                    style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 8,
                        opacity: isSending ? 0.5 : 1,
                        borderWidth: 1,
                        borderColor: "#333",
                }}>
                    <Text>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}