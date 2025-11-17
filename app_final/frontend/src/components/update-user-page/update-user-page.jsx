import { useUpdateUser } from "./use-update-user.js";
import ArrowRightIcon from "../img/arrow-right";
import TextInput from "../ui/text-input";
import MainButton from "../ui/main-button";
import DropdownInput from "../ui/dropdown-input";
import TextareaInput from "../ui/textarea-input";

export function UpdateUserPage() {
    const {
        error,
        message,
        loading,
        formData,
        businessSphereOptions,
        regionOptions,
        handleChange,
        handleSubmit,
        handleLogout,
        navigate
    } = useUpdateUser();
    return (
        <div className="">
            <div className="flex justify-between items-center">
                <button
                    className="bg-secondary-bg-color transition-all hover:bg-secondary-bg-hover-color p-3 rounded-2xl"
                    onClick={() => navigate("/")}
                >
                    {" "}
                    <ArrowRightIcon />{" "}
                </button>
                <span className="font-medium text-xl">Настройки</span>
                <button
                    tabIndex="-1"
                    className="bg-transparent text-transparent cursor-default p-3 rounded-2xl"
                >
                    {" "}
                    <ArrowRightIcon />{" "}
                </button>
            </div>
            <form
                className="mt-[4vh] w-fill flex flex-col gap-1"
                onSubmit={handleSubmit}
            >
                <TextInput
                    type="text"
                    name="name"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <TextInput
                    type="email"
                    name="email"
                    placeholder="Почта"
                    value={formData.email}
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
                <TextInput
                    type="password"
                    name="password"
                    placeholder="Новый пароль (необязательно)"
                    value={formData.password}
                    onChange={handleChange}
                />
                <TextInput
                    type="password"
                    name="check_password"
                    placeholder="Подтвердите пароль"
                    value={formData.check_password}
                    onChange={handleChange}
                />
                {error && (
                    <p className="text-center w-full text-[#FF3E3E] mt-3">
                        {error}
                    </p>
                )}
                {message && (
                    <p className="text-center w-full mt-3">
                        {message}
                    </p>
                )}
                <MainButton type="submit" disabled={loading} className="mt-4">
                    {loading ? "Загрузка..." : "Изменить данные"}
                </MainButton>
            </form>
            <MainButton onClick={handleLogout} isPrimary={false} disabled={loading} className="mt-2 text-[#FF3E3E]">
                {loading ? "Загрузка..." : "Выйти из аккаунта"}
            </MainButton>
        </div>
    );
}
