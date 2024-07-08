// src/pages/index.tsx

import { FormEvent, useState } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import ResultComponent from "../components/ResultComponent";
import { IFetchingState } from "../types";

const fetchingStateInit: IFetchingState = {
  data: null,
  isLoading: false,
  error: null,
};

const Home: NextPage = () => {
  const [keyword, setKeyword] = useState("");
  const [place, setPlace] = useState("");
  const [itemsCount, setItemsCount] = useState(20);
  const [isRequestMade, setIsRequestMade] = useState(false);
  const [fetchingState, setFetchingState] = useState(fetchingStateInit);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!keyword || !place) return;
    setIsRequestMade(true);
    setFetchingState((prev) => ({ ...prev, isLoading: true }));

    try {
      const resp = await fetch(
        `/api/puppeteer?keyword=${keyword}&itemsCount=${itemsCount}&place=${place}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      );

      const { data, msg } = await resp.json();
      setFetchingState((prev) => ({ ...prev, data: data, error: msg }));
    } catch (error: any) {
      console.info(error.message);
      setFetchingState((prev) => ({
        ...prev,
        error: error.msg,
      }));
    } finally {
      setFetchingState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  return (
    <div className="mx-auto my-auto flex items-center justify-center flex-col space-y-5 ">
      <Head>
        <title>Nextjs Puppeteer</title>
        <meta name="description" content="Screenshot any Website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full flex flex-col items-center justify-start h-lvh p-10 text-center ">
        <h1 className="text-5xl font-bold text-indigo-500 mb-4">
          Сбор данных с гугл мест
        </h1>
        <form
          onSubmit={onSubmit}
          className="flex items-center flex-col space-y-5 mt-10 w-full"
        >
          <div className="grid gap-6 mb-6 md:grid-cols-2 max-w-4xl">
            <div>
              <label
                htmlFor="keyword"
                className="block text-left mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Ключевые слова
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ключевые слова"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="place"
                className="block text-left mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Место
              </label>
              <input
                type="text"
                id="place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Место"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <div
                className="flex items-start  text-white text-xs mt-2"
                role="alert"
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                </svg>
                <p className="text-left">Тут можно написать не только название города, можно комбинацию город + область или еще как-то, главное чтобы в гугле место находилось</p>
              </div>
            </div>
            <div>
              <label
                htmlFor="numResults"
                className="block text-left mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Количество результатов
              </label>
              <input
                 type="number"
                id="numResults"
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                placeholder="Количество результатов"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
               
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-10 py-3 bg-indigo-500 text-sm rounded-full text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Поиск
          </button>
        </form>

        {isRequestMade && (
          <ResultComponent state={fetchingState} filename={`${keyword}__${place}`} />
        )}
      </main>
    </div>
  );
};

export default Home;
