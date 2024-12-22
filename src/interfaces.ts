export interface Tweet {
    userName: string;
    displayName: string;
    text: string;
    createDate: string;
    media?: Media[];
}

export interface Media {
    url: string;
    base64: string;
    file_type: string;
}
