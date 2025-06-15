import { collection, orderBy, query } from "firebase/firestore";
import { useState } from "react";
import { toast } from "react-toastify";
import FireStore, { db } from "../../../../../firebase/FireStore";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import BrandedButton from "../../../../utils/brandedButton/BrandedButton";
import ConfirmPopup from "../../../../utils/ConfirmPopup";
import LoadingPanel from "../../../../utils/loadingPanel/LoadingPanel";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import { useUserStore } from "./../../../../../context/userStore";
import "./Activation.css";
import ActivationForm from "./ActivationForm";

const Activation = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const [selectedActivation, setSelectedActivation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activations, setActivations] = useState([]);
  const [confirmUnactivation, setConfirmUnactivation] = useState(null);

  const [isLoadingUnactivation, setIsloadingUnactivation] = useState(false);

  const myQueryBuilder = () => {
    return query(collection(db, "activations"), orderBy("entry.date", "desc"));
  };

  const handleDataChange = (data) => {
    setActivations(data)
  };

  const unActiveStock = async () => {
    setIsloadingUnactivation(true);
    const toastId = toast.loading("Inactivando...");
    let activationItem = { ...confirmUnactivation, active: false };
    activationItem.exit = {
      date: new Date(),
      user: {
        uid: currentUser.uid,
        username: currentUser.username,
      },
    };

    FireStore.update("activations", activationItem)
      .then(() => {
        toast.update(toastId, {
          render: "Proceso inactivado",
          type: "success",
          autoClose: 3000,
          isLoading: false,
        });
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Error al inactivar",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
    setConfirmUnactivation(null);
    setIsloadingUnactivation(false);
  };

  return (
    <div className="formContainer">
      <div className="activation">
        <div className="header">
          <h2>Activaciones</h2>
          <div className="leftHeader">
            <div className="buttons">
              <BrandedButton
                type="add"
                label="Nueva Activación"
                onClick={() => setSelectedActivation({})}
              />
              <BrandedButton type="close" onClick={() => onClose()} />
            </div>
          </div>
        </div>
        <div className="content">
          {loading && <LoadingPanel />}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Activación</th>
                  <th>Responsable</th>
                  <th>Lote</th>
                  <th>vida Útil</th>
                  <th>Vencimiento</th>
                  <th>Inactivación</th>
                  <th>Responsable</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activations?.map((activationItem, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <span
                          className={
                            activationItem.exit
                              ? "status-badge inactive"
                              : "status-badge active"
                          }
                        >
                          {activationItem.exit ? "Inactivo" : "Activo"}
                        </span>
                      </td>
                      <td>
                        {dateToYYYYMMDD(activationItem.entry.date.toDate())}
                      </td>
                      <td>{activationItem.entry.user.username}</td>
                      <td>{activationItem.lot}</td>
                      <td>{activationItem.life}</td>
                      <td>{dateToYYYYMMDD(activationItem.exp.toDate())}</td>
                      <td>
                        {activationItem.exit
                          ? dateToYYYYMMDD(activationItem.exit?.date?.toDate())
                          : ""}
                      </td>
                      <td>
                        {activationItem.exit
                          ? activationItem.exit.user.username
                          : ""}
                      </td>
                      <td>
                        {!activationItem.exit && (
                          <span>
                            <BrandedButton
                              type="delete"
                              isLoading={isLoadingUnactivation}
                              onClick={() =>
                                setConfirmUnactivation(activationItem)
                              }
                            />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PageIndex
            queryBuilder={myQueryBuilder}
            onDataChange={handleDataChange}
            pageSize={14}
          />
        </div>
        {selectedActivation && (
          <ActivationForm
            onClose={() => setSelectedActivation(null)}
            activation={selectedActivation}
          />
        )}
        {!!confirmUnactivation && (
          <ConfirmPopup
            message={
              "¿Estás segura que desea inactivar la activación seleccionada?, esto no se puede deshacer"
            }
            onConfirm={unActiveStock}
            onCancel={() => setConfirmUnactivation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Activation;
