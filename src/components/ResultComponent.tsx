// src/components/ResultComponent.tsx

import { Fragment, FunctionComponent, useState } from "react";

import { FaceFrownIcon, BoltIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import * as XLSX from "xlsx";

import { IFetchingState } from "../types";
import getDomain from "../utils/getDomain";

interface IResultComponentProps {
  state: IFetchingState;
  filename: string;
}

const ResultComponent: FunctionComponent<IResultComponentProps> = (props) => {
  const {
    state: { isLoading, error, data },
    filename,
  } = props;
  const [errorMessage, setErrorMessage] = useState("");

  const downloadExcelFile = async () => {
    try {
      // Create Excel workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils?.json_to_sheet(data!);
      XLSX.utils.book_append_sheet(workbook, worksheet, filename);
      // Save the workbook as an Excel file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      console.log(`Exported data to ${filename}.xlsx`);
    } catch (error: any) {
      console.log("#==================Export Error", error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className={` w-full grow h-1/2 block mt-6 bg-slate-700`}>
      {!isLoading ? (
        <Fragment>
          {data && (
            <div className="flex justify-between items-start gap-8 h-full">
              <div className="overflow-auto h-full grow w-1/2">
                <table className="w-full text-sm text-left rtl:text-right text-gray-400 ">
                  <thead className="text-xsuppercase bg-gray-700 text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Название</th>
                      <th className="px-6 py-3">Локация</th>
                      <th className="px-6 py-3">Номер телефона</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((el) => (
                      <tr key={el.phone} className="bg-gray-800">
                        <td className="px-6 py-4">{el.name}</td>
                        <td className="px-6 py-4">{el.address}</td>
                        <td className="px-6 py-4">
                          <a href={`tel:${el.phone}`}>{el.phone}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length && (
                <div className="w-1/4 p-4 flex h-full items-center justify-center">
                  <button
                    type="submit"
                    onClick={() => downloadExcelFile()}
                    className="px-10 py-3 bg-indigo-500 text-sm rounded-full text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Скачать
                  </button>
                  {errorMessage && <p className="text-rose-600">{errorMessage}</p>}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="w-full h-full flex flex-col space-y-5 items-center justify-center p-2">
              <div className="flex items-center">
                <FaceFrownIcon className="w-14 h-14 text-red-600" />
                <FaceFrownIcon className="w-14 h-14 text-red-600" />
              </div>

              <div className="flex flex-col divide-y divide-gray-200 w-full">
                <span className="text-base text-red-500 pb-2">
                  Ошибка: {error}.
                </span>
              </div>
            </div>
          )}
        </Fragment>
      ) : (
        <div className="w-full h-full flex flex-col space-y-2 items-center justify-center p-8 animate-pulse">
          <BoltIcon className="w-20 h-20 text-indigo-600 animate-bounce" />
          <span className="text-base text-white">Грузим что-то...</span>
        </div>
      )}
    </div>
  );
};

export default ResultComponent;
