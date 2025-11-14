import { useLogin } from "./useLogin";

export function Login() {
    const {
        error,
        loading,
        formData,
        handleChange,
        handleCheck,
        handleSubmit,
    } = useLogin();
    return (
        <div className="container">
            <h1>Login</h1>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <button onClick={handleCheck}>Check server</button>
            <a href="/register">Don't have an account? Register</a>
        </div>
    );
}
