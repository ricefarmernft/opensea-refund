import useFetch from "../hooks/useFetch";
import { useEffect, useState } from "react";
import Transactions from "./Transactions";
import Loader from "./Loader";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import Web3 from "web3";

const web3 = new Web3(
  "https://eth-mainnet.g.alchemy.com/v2/0ByceosjiOQZ9Ww_sr5oCCJL6Nmi8q1S"
);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [eth, setEth] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [sort, setSort] = useState(true);

  const [address, setAddress] = useState();

  const { get } = useFetch("https://api.etherscan.io/api");
  const api = "FF3VM3BZW5NGH5HGRT3MKIK7HMZV6JR69P";
  const totalEth = (eth.result * Math.pow(10, -18)).toFixed(3);

  const openseaAddresses = [
    "0x7f268357a8c2552623316e2562d90e642bb538e5",
    "0x00000000006c3852cbef3e08e8df289169ede581",
    "0x00000000006cee72100d161c57ada5bb2be1ca79",
    "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b",
  ];

  // Get address from ENS function
  async function getEnsOwner(ens) {
    const owner = await web3.eth.ens.getAddress(ens);
    setAddress(owner);
  }

  // Set Ethereum Address from input
  const onChangeAddress = (event) => {
    event.preventDefault();
    const input = event.target.value;
    if (input.endsWith(".eth")) {
      getEnsOwner(input);
      setLoading(true);
    } else if (input.length === 42) {
      setAddress(input);
      setLoading(true);
    } else {
      console.log("Input not valid.");
      setAddress();
      setLoading(false);
    }
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
          (tx) =>
            (tx.isError === "1" && tx.to.includes(openseaAddresses[0])) ||
            (tx.isError === "1" && tx.to.includes(openseaAddresses[1])) ||
            (tx.isError === "1" && tx.to.includes(openseaAddresses[2])) ||
            (tx.isError === "1" && tx.to.includes(openseaAddresses[3]))
        );
        setLoading(false);
        setTransactions(failed);
        setFilteredTransactions(failed);
      })
      .catch((error) => {
        console.log("Could not load Eth balance", error);
        setTransactions([]);
        setFilteredTransactions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Sort TX past 30 days
  useEffect(() => {
    if (!sort) {
      setFilteredTransactions(
        transactions.filter((transaction) => {
          const thirtyDaysDate = new Date();
          thirtyDaysDate.setDate(thirtyDaysDate.getDate() - 30);

          const txDate = new Date(transaction.timeStamp * 1000);

          return txDate > thirtyDaysDate;
        })
      );
    } else {
      setFilteredTransactions(transactions);
    }
    //eslint-disable-next-line
  }, [sort]);

  const handleDateSort = () => {
    setSort(!sort);
  };

  // Formula for gas fee
  const totalGas = () => {
    let sum = 0;
    filteredTransactions.forEach((transaction) => {
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
          placeholder="Ethereum Address / ENS"
          onChange={onChangeAddress}
        ></input>
        <p>Balance: {totalEth > 0 ? totalEth : 0} Ξ</p>
      </div>
      <div className="container total">
        <p>
          Gas Spent on Failed Opensea Tx's:{" "}
          <strong>{totalGas().toFixed(5)} Ξ</strong>
        </p>
      </div>
      {loading && <Loader />}
      {address && !loading && (
        <div className="body">
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
          <div className="container filters">
            <button className="btn-month" onClick={handleDateSort}>
              {sort ? "Sort 30 Days" : "Show All"}
            </button>
          </div>
          <div className="container transactions">
            <table className="tx-table" id="table-to-xls">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tx Hash</th>
                  <th>Gas Fee Ξ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
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
                  <td>{totalGas().toFixed(5)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
