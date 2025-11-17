import TextInput from "../ui/text-input";
import MainButton from "../ui/main-button";
import { useChat } from "./use-chat";

import { useParams } from "react-router-dom";
import { TenderMiniCard } from "./tender-mini-card";
import ArrowRightIcon from "../img/arrow-right";
import ArrowTopIcon from "../img/arrow-top";
import clsx from "clsx";

export function ChatPage() {
    const { tenderId } = useParams();
    const {
        error,
        tender,
        loading,
        messages,
        messageText,
        handleChange,
        handleSubmit,
        navigate,
    } = useChat(tenderId);
    return (
        <>
            <div className="grow-0 mt-[6vh]">
                <button
                    className=" bg-transparent flex gap-0.5 items-center"
                    onClick={() => navigate("/")}
                >
                    <ArrowRightIcon />
                    <span>Назад</span>
                </button>
                <TenderMiniCard className="mt-6" {...tender} />
            </div>
            <div className="grow flex flex-col mt-6 min-h-0">
                <div className="grow flex flex-col gap-6 overflow-y-auto overflow-x-hidden min-h-0">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <Message key={index} isResponse={index % 2 === 1}>
                                {message}
                            </Message>
                        ))
                    ) : (
                        <div className="flex items-center grow justify-center">
                            <div className="text-secondary-color text-center px-3">
                                Задайте вопрос о тендере нейросети, и она
                                ответит на него на основе информации со страницы
                                тендера
                            </div>
                        </div>
                    )}
                </div>
                {/* </div> */}
                <div className="grow-0 flex gap-4 items-center mt-6">
                    <TextInput
                        id="input"
                        type="text"
                        value={messageText}
                        disabled={loading}
                        onChange={handleChange}
                        placeholder="Вопрос по тендеру"
                        className="grow"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-highlight hover:bg-highlight-hover disabled:bg-highlight-disabled p-3 w-fit h-fit rounded-lg"
                    >
                        <ArrowTopIcon />
                    </button>
                </div>
                {error && (
                    <p className="text-center w-full text-[#FF3E3E] mt-3">
                        {error}
                    </p>
                )}
            </div>
        </>
    );
}

function Message({ isResponse = false, children }) {
    return (
        <div
            className={clsx(
                "flex",
                isResponse ? "justify-baseline" : "justify-end"
            )}
        >
            <div
                className={clsx(
                    "max-w-4/5 h-fit rounded-2xl p-4 wrap-anywhere text-sm",
                    isResponse
                        ? "bg-secondary-bg-hover-color"
                        : "bg-secondary-bg-color"
                )}
            >
                {children}
            </div>
        </div>
    );
}
