import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

export const localStorage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export const sessionStorage =
  typeof window !== "undefined"
    ? createWebStorage("session")
    : createNoopStorage();
