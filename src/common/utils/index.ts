import mongoose from "mongoose";

export function createQueryParams(queryFilter: Object): string {
    let queryParams = Object.keys(queryFilter)
      .filter(
        (key) => queryFilter[key] !== undefined && queryFilter[key] !== null,
      )
      .map((key) => `${key}=${encodeURIComponent(queryFilter[key])}`)
      .join('&');

    return queryParams ? `${queryParams}` : '';
  }

  export const transStringToObjectId = (id: string) => {
    return new mongoose.Types.ObjectId(id);
  };