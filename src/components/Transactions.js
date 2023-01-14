import { useEffect, useState } from "react";

export default function Transactions(props) {
  const { timeStamp, gasPrice, gasUsed, hash } = props.transaction;
  const [hashString, setHashString] = useState(hash);

  const date = new Date(timeStamp * 1000);

  const gas = (gasPrice * gasUsed * Math.pow(10, -18)).toFixed(5);

  const link = `https://etherscan.io/tx/${hash}`;

  // Truncate TX hash
  useEffect(() => {
    if (window.innerWidth <= 655 && window.innerWidth > 530) {
      setHashString(hash.substring(0, 45) + "...");
    } else if (window.innerWidth <= 530 && window.innerWidth > 390) {
      setHashString(hash.substring(0, 30) + "...");
    } else if (window.innerWidth <= 390 && window.innerWidth > 335) {
      setHashString(hash.substring(0, 20) + "...");
    } else if (window.innerWidth <= 335) {
      setHashString(hash.substring(0, 4) + "...");
    } else {
      setHashString(hash);
    }
    //eslint-disable-next-line
  }, []);

  return (
    <>
      <tr className="transaction">
        <td className="time">
          <p>{date.toLocaleDateString()}</p>
        </td>
        <td className="hash">
          <a href={link} target="_blank" rel="noreferrer">
            {hashString}
          </a>
        </td>
        <td className="gas">
          <p>{gas}</p>
        </td>
      </tr>
    </>
  );
}
