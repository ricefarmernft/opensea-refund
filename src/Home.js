import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import Transactions from "./Transactions";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

export default function Home() {
  const [eth, setEth] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState();

  const { get } = useFetch("https://api.etherscan.io/api");
  const api = "FF3VM3BZW5NGH5HGRT3MKIK7HMZV6JR69P";
  const totalEth = (eth.result * Math.pow(10, -18)).toFixed(3);

  // Set Ethereum Address fron input
  const onChangeAddress = (event) => {
    event.preventDefault();
    setAddress(event.target.value);
  };

  // Fetch ETH Balance for input ETH address
  useEffect(() => {
    get(
      `?module=account&action=balance&address=${address}&tag=latest&apikey=${api}`
    )
      .then((data) => {
        setEth(data);
      })
      .catch((error) => console.log("Could not load Eth balance", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Fetch transactions for ETH address
  useEffect(() => {
    get(
      `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=desc&apikey=${api}}`
    )
      .then((data) => {
        // Sort data by failed TX and Opensea TX
        const failed = data.result.filter(
          (data) =>
            (data.isError === "1" &&
              data.to.includes("0x7f268357a8c2552623316e2562d90e642bb538e5")) ||
            (data.isError === "1" &&
              data.to.includes("0x7be8076f4ea4a4ad08075c2508e481d6c946d12b"))
        );
        setTransactions(failed);
      })
      .catch((error) => console.log("Could not load Eth balance", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Formula for gas fee
  const totalGas = () => {
    let sum = 0;
    transactions.forEach((transaction) => {
      sum =
        transaction.gasPrice * transaction.gasUsed * Math.pow(10, -18) + sum;
    });
    return sum;
  };

  return (
    <>
      <div className="container home">
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Ethereum Address"
          onChange={onChangeAddress}
        ></input>
        <p>Balance: {totalEth > 0 ? totalEth : 0} Ξ</p>
      </div>
      <div className="container total">
        <p>
          Total Gas Spent on Failed Opensea Tx's:{" "}
          <strong>{totalGas().toFixed(5)} Ξ</strong>
        </p>
      </div>
      <div className="container excel">
        <ReactHTMLTableToExcel
          id="test-table-xls-button"
          className="container download-table-xls-button"
          table="table-to-xls"
          filename="OSfailedtxs"
          sheet="tablexls"
          buttonText="Download as XLS"
        />
      </div>
      <div className="container transactions">
        <table className="tx-table" id="table-to-xls">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tx Hash</th>
              <th>Gas Fee</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              return (
                <Transactions
                  key={transaction.blockNumber}
                  transaction={transaction}
                />
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="2">Total Fee :</th>
              <td>{totalGas().toFixed(5)}Ξ</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
