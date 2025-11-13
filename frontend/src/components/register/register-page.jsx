import { useRegister } from "./useRegister";

export function Register() {
    
    const {
            error,
            loading,
            formData,
            handleChange,
            handleSubmit,
        } = useRegister();

    return (
        <div className="container">
            <h1>Register</h1>
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label htmlFor="name">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                    />
                </div>
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
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <a href="/login">Already have an account? Login</a>
        </div>
    );
}
