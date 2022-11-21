// import { useState } from "react";

export default function useFetch(baseURL) {
    
    function get(url) {
        return new Promise((resolve, reject) => {
            fetch(baseURL + url)
            .then(response => response.json())
            .then(data => {
                if(!data) {
                    return reject(data);
                }
                resolve(data);
            })
            .catch(error => {
                reject(error);
            })
        })
    }

    function post(url, body) {
        return new Promise((resolve, reject) => {
          fetch(baseURL + url, {
            ...{
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            },
          })
            .then((response) => response.json())
            .then((data) => {
              if (!data) {
                return reject(data);
              }
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    
      return { get, post };
}