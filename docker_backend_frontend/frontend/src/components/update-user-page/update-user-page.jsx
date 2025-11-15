/* eslint-disable no-unused-vars */
import { useUpdateUser } from "./use-update-user.js";

export function UpdateUserPage() {
    const { error, loading, formData, handleChange, handleSubmit } =
        useUpdateUser();
    return (
        <div className="">
            <h1 className="">Change user data</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        maxLength={30}
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
                        maxLength={30}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="business_sphere">Business sphere</label>
                    <select
                        id="business_sphere"
                        name="business_sphere"
                        value={formData.business_sphere}
                        onChange={handleChange}
                        required
                    >
                        <option value="selling-bananas">Selling bananas</option>
                        <option value="selling-people">Selling people</option>
                    </select>
                </div>
                <div className="mb-2">
                    <label htmlFor="region">Region</label>
                    <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                    >
                        <option value="moscow">Moscow</option>
                    </select>
                </div>
                <div className="mb-2">
                    <label htmlFor="desc">Business description</label>
                    <textarea
                        id="desc"
                        name="desc"
                        maxLength={400}
                        value={formData.desc}
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
                        maxLength={20}
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>

            {error && <div className="">{error}</div>}
        </div>
    );
}
