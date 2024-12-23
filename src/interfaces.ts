export interface Tweet {
    userName: string;
    displayName: string;
    text: string;
    createDate: string;
    media?: Media[];
    quote?: Tweet;
}

export interface Media {
    url: string;
    base64: string;
    fileType: string;
}
