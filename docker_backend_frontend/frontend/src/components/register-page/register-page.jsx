import TextInput from "../ui/text-input";
import MainButton from "../ui/main-button";
import DropdownInput from "../ui/dropdown-input";
import TextareaInput from "../ui/textarea-input";
import { useRegister } from "./useRegister";

import authBg from "../img/auth-bg.png";
import ArrowRightIcon from "../img/arrow-right";

export function RegisterPage() {
    const {
        error,
        loading,
        formData,
        isSecondPhase,
        businessSphereOptions,
        regionOptions,
        setIsSecondPhase,
        handleChange,
        handleSubmit,
    } = useRegister();

    const firstPhase = (
        <div className="">
            <img
                src={authBg}
                alt=""
                className="absolute w-full h-full top-0 left-0 -z-10"
            />
            <div className="mt-[12vh]">
                <h1 className="text-center text-2xl font-semibold">
                    Добро пожаловать в Тенди
                </h1>
                <p className="text-center text-[1rem] wrap-normal">
                    Сервис по подбору{" "}
                    <span className="line-through">дешевых авиабилетов</span>{" "}
                    тендеров
                </p>
            </div>

            <div className="mt-[12vh] w-fill flex flex-col gap-1">
                <TextInput
                    type="email"
                    name="email"
                    placeholder="Почта"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <TextInput
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <TextInput
                    type="password"
                    name="check_password"
                    placeholder="Подтвердите пароль"
                    value={formData.check_password}
                    onChange={handleChange}
                    required
                />
                {error && (
                    <p className="text-center w-full text-[#FF3E3E] mt-3">
                        {error}
                    </p>
                )}
                <MainButton
                    disabled={loading}
                    onClick={() => setIsSecondPhase(true)}
                    className="mt-4"
                >
                    {loading ? "Загрузка..." : "Далее"}
                </MainButton>
            </div>
            <p className="text-secondary-color w-full text-center mt-4">
                Уже есть аккаунт?{" "}
                <a className="underline" href="/login">
                    Войти
                </a>
            </p>
        </div>
    );

    const secondPhase = (
        <div className="">
            <img
                src={authBg}
                alt=""
                className="absolute w-full h-full top-0 left-0 -z-10"
            />
            <div className="mt-[12vh]">
                <button
                    className="bg-transparent flex gap-0.5 items-center"
                    onClick={() => setIsSecondPhase(false)}
                >
                    <ArrowRightIcon />
                    <span>Назад</span>
                </button>
            </div>

            <form
                className="mt-[4vh] w-fill flex flex-col gap-1"
                onSubmit={handleSubmit}
            >
                <TextInput
                    className="hidden"
                    type="email"
                    name="email"
                    placeholder="Почта"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <TextInput
                    className="hidden"
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <TextInput
                    type="text"
                    name="name"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <DropdownInput
                    name="business_sphere"
                    value={formData.business_sphere}
                    onChange={handleChange}
                    required
                    options={businessSphereOptions}
                />
                <TextareaInput
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                    rows="7"
                    placeholder="Описание бизнеса (около 60 слов)"
                    maxLength="400"
                />
                <DropdownInput
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    options={regionOptions}
                />
                {error && (
                    <p className="text-center w-full text-[#FF3E3E] mt-3">
                        {error}
                    </p>
                )}
                <MainButton type="submit" disabled={loading} className="mt-4">
                    {loading ? "Загрузка..." : "Зарегистрироваться"}
                </MainButton>
            </form>
        </div>
    );

    return isSecondPhase ? secondPhase : firstPhase;
}
