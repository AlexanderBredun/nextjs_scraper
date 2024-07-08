export interface IFetchingState {
    data: {
        address: string;
        phone: string;
        name: string;
    }[] | null;
    isLoading: boolean;
    error: string | null;
}