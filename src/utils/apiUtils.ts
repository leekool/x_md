export const getTweet = async (id: string) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = `${baseUrl}/x/${id}`;

    const response = await fetch(url);

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
}
