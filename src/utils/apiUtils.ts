export const getTweet = async (id: string) => {
    // const url = `https://api.imre.al/x/${id}`;
    const url = `http://localhost:3000/api/x/${id}`;

    const response = await fetch(url);

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
}
