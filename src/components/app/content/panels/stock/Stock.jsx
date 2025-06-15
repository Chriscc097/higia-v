import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import FireStore, { db } from "../../../../../firebase/FireStore";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import ConfirmPopup from "../../../../utils/ConfirmPopup";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import { useUserStore } from "./../../../../../context/userStore";
import "./Stock.css";

const Stock = ({ client }) => {
  const centerRef = useRef(null);
  const [stock, setStock] = useState(null);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockView, setStockView] = useState(false);
  const [packages, setPackages] = useState([]);
  const [stockTablevisible, setStockTableVisible] = useState({});
  const { currentUser } = useUserStore();
  const [confirmToggleActivation, setConfirmToggleActivation] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "packages"), orderBy("name", "asc")),
      (snapshot) => {
        const packagesdata = snapshot.docs.map((doc) => doc.data());
        setPackages(packagesdata);
      }
    );
    return () => unsubscribe();
  }, []);

  const myQueryBuilder = () => {
    return query(
      collection(db, "stock"),
      orderBy("id", "asc"),
      where("clientId", "==", client?.id)
    );
  };

  const handleDataChange = (data) => {
    setStockList(data)
  };

  const handleSelect = async (stock) => {
    setStock(stock);
    setStockView(true);
  };

  const groupedStockList = stockList.reduce((acc, stock) => {
    if (!acc[stock.clientId]) {
      acc[stock.clientId] = {};
    }
    if (!acc[stock.clientId][stock.package.id]) {
      acc[stock.clientId][stock.package.id] = [];
    }
    acc[stock.clientId][stock.package.id].push(stock);
    return acc;
  }, {});

  const toogleStockTableVisible = (key) => {
    setStockTableVisible((prev) => {
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const handleToogleActiveStock = async (stockItem) => {
    await setConfirmToggleActivation(stockItem);
  };

  const toogleActiveStock = async () => {
    if (loading) return;
    setLoading(true);

    let stockItem = { ...confirmToggleActivation };

    if (!stockItem) {
      setLoading(false);
      return;
    }

    if (stockItem.exit) {
      stockItem.exit = null;
      stockItem.status = "Consultorio";
    } else {
      stockItem.exit = {
        user: {
          username: currentUser.username,
          uid: currentUser.uid,
        },
        date: dateToYYYYMMDD(new Date()),
      };
      stockItem.status = "Disp. Final";
    }
    setConfirmToggleActivation(null);
    await FireStore.update("stock", stockItem);
    setLoading(false);
  };

  return (
    <div className="stock">
      <div className="stockContent">
        <div className="clientSection" ref={centerRef}>
          <div>
            {packages
              .filter(
                (pk) =>
                  groupedStockList[client.id] &&
                  groupedStockList[client.id][pk.id] &&
                  groupedStockList[client.id][pk.id].length > 0
              )
              .map((pk) => (
                <div key={pk.id} className="packageInfo">
                  <div
                    className="packageInfoTitle"
                    onClick={() =>
                      toogleStockTableVisible(client.id + "-" + pk.id)
                    }
                  >
                    <div className="packageInfoItem">
                      <h1>
                        {groupedStockList[client.id][pk.id]?.filter(
                          (s) => !s?.exit
                        ).length || 0}
                      </h1>
                    </div>
                    <div className="packageInfoItem">
                      <h4>{pk.name}</h4>
                      <h5>{"Contenido: " + pk.content}</h5>
                    </div>
                  </div>

                  {stockTablevisible[client?.id + "-" + pk.id] && (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Estado</th>
                            <th>Código</th>
                            <th>Ubicación</th>
                            <th>Alta</th>
                            <th>Responsable</th>
                            <th>Baja</th>
                            <th>Responsable</th>
                            <th>Usos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedStockList[client.id][pk.id]?.map(
                            (stockItem, index) => {
                              return (
                                <tr
                                  key={stockItem.id || index}
                                  onClick={() => handleSelect(stockItem)}
                                >
                                  <td
                                    onClick={() =>
                                      handleToogleActiveStock(stockItem)
                                    }
                                  >
                                    <span
                                      className={
                                        !stockItem?.exit
                                          ? "status-badge active"
                                          : "status-badge inactive"
                                      }
                                    >
                                      {!stockItem?.exit ? "Activo" : "Inactivo"}
                                    </span>
                                  </td>
                                  <td>{stockItem.id}</td>
                                  <td>
                                    <span
                                      className={
                                        stockItem.status === "Almacén"
                                          ? "status-badge in"
                                          : stockItem.status === "Disp. Final"
                                          ? "status-badge trash"
                                          : "status-badge out"
                                      }
                                    >
                                      {stockItem.status}
                                    </span>
                                  </td>
                                  <td>{stockItem?.entry?.date}</td>
                                  <td>{stockItem?.entry?.user?.username}</td>
                                  <td>{stockItem?.exit?.date}</td>
                                  <td>{stockItem?.exit?.user?.username}</td>
                                  <td>{stockItem?.uses}</td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                      {loading && <LoadingPanel />}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      {!!confirmToggleActivation && (
        <ConfirmPopup
          message={
            !stock?.exit
              ? "¿Deseas dar de baja este material? Se registrará la fecha, el usuario responsable y se realizará la Disposición Final"
              : "¿Deseas dar de alta este material? Se eliminará la fecha y el usuario responsable de la baja. Y se moverá al Almacén"
          }
          onConfirm={toogleActiveStock}
          onCancel={() => setConfirmToggleActivation(null)}
        />
      )}
      <PageIndex
        queryBuilder={myQueryBuilder}
        onDataChange={handleDataChange}
        pageSize={100}
      />
    </div>
  );
};
export default Stock;
