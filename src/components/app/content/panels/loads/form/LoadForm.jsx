import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  CircleArrowOutUpRight,
  CircleCheckBig,
  CircleOff,
  Package2,
  Package2Icon,
  Route,
} from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import useClientStore from "../../../../../../context/clientStore";
import { useUserStore } from "../../../../../../context/userStore";
import FireStore, { db } from "../../../../../../firebase/FireStore";
import FirebaseStorage from "../../../../../../firebase/FirebaseStorage";
import {
  addTimeToDate,
  dateToDDMMYYYY,
  dateToLongString,
  dateToYYYYMMDD,
  diffDays,
  formatDateHour,
  getDayOfYear,
  getExpColor,
} from "../../../../../../utils/dates-functions";
import { generateBarcodePDF } from "../../../../../../utils/labels";
import BrandedButton from "../../../../../utils/brandedButton/BrandedButton";
import FileSelector from "../../../../../utils/fileSelector/FileSelector";
import FileViewer from "../../../../../utils/fileSelector/FileViewer";
import CancelForm from "./../cancel/CancelForm";
import "./LoadForm.css";

const LoadForm = ({ onClose, load }) => {
  // Generalidades
  const [isLoading, setIsLoading] = useState(false);
  const [quantityStock, setQuantityStock] = useState(1);
  const { currentUser } = useUserStore();
  const [loadData, setLoadData] = useState({
    ...load,
    status: load?.status || "Sin Iniciar",
    date: load?.date || Timestamp.fromDate(new Date()),
    days: load?.days || 1,
  });

  const clients = useClientStore((state) => state.clients);
  const [menuOptions, setMenuOptions] = useState([
    { label: "Ruta", isSelected: true },
    { label: "Paquetes", isSelected: false },
    { label: "Controles", isSelected: false },
  ]);

  //Cycles
  const [cycles, setCycles] = useState([]);
  useEffect(() => {
    if (!loadData.id || cycles.length > 0) return;
    const cyclesRef = collection(db, "cycles");
    const q = query(cyclesRef, where("loadId", "==", loadData.id));
    getDocs(q)
      .then((querySnapshot) => {
        setCycles(querySnapshot.docs.map((doc) => doc.data()));
      })
      .catch((error) => {
        console.error("Error fetching cycles: ", error);
      });
  }, []);

  // Rutas
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    const routesRef = collection(db, "routes");
    getDocs(routesRef)
      .then((querySnapshot) => {
        const routes = querySnapshot.docs.map((doc) => doc.data());
        setRoutes(routes);
      })
      .catch((error) => {
        console.error("Error fetching routes: ", error);
      })
      .finally(() => {});
  }, []);

  const [process, setProcess] = useState([]);
  useEffect(() => {
    const processRef = collection(db, "process");
    getDocs(processRef)
      .then((querySnapshot) => {
        const process = querySnapshot.docs.map((doc) => doc.data());
        setProcess(process);
      })
      .catch((error) => {
        console.error("Error fetching process: ", error);
      })
      .finally(() => {});
  });

  const handleRouteChange = (e) => {
    const routeId = e.value;
    const selectedRoute = { ...routes.find((route) => route.id === routeId) };
    const processMap = selectedRoute?.process?.map((processId) => {
      return { ...process.find((processItem) => processItem.id === processId) };
    });
    selectedRoute.process = processMap;
    setLoadData((prevLoadData) => ({
      ...prevLoadData,
      route: selectedRoute,
    }));
  };

  const [equipments, setEquipments] = useState([]);
  useEffect(() => {
    const equipmentsRef = collection(db, "equipments");
    getDocs(equipmentsRef)
      .then((querySnapshot) => {
        const equipments = querySnapshot.docs.map((doc) => doc.data());
        setEquipments(equipments);
      })
      .catch((error) => {
        console.error("Error fetching equipments: ", error);
      });
  }, []);

  const [activations, setActivations] = useState([]);
  useEffect(() => {
    const equipmentsRef = collection(db, "activations");
    const q = query(equipmentsRef, where("active", "==", true));
    getDocs(q)
      .then((querySnapshot) => {
        const equipments = querySnapshot.docs.map((doc) => doc.data());
        setActivations(equipments);
      })
      .catch((error) => {
        console.error("Error fetching activations: ", error);
      })
      .finally(() => {});
  }, []);

  // Paquetes
  const [clientStock, setClientStock] = useState([]);
  const [clientPackages, setClientPackages] = useState([]);

  const handleSelectedMenu = (option) => {
    const newMenuOptions = menuOptions.map((menuOption) => {
      if (menuOption.label === option.label) {
        return { ...menuOption, isSelected: true };
      } else {
        return { ...menuOption, isSelected: false };
      }
    });
    setMenuOptions(newMenuOptions);
  };

  const handleRemovePackage = (cycleItem) => {
    const newCycles = cycles.filter(
      (cycle) => cycle.stockId !== cycleItem.stockId
    );
    setCycles(newCycles);
  };

  const handleAddPackage = (stockItemData) => {
    const stockItem = stockItemData.value;
    setCycles((prevCycles) => [
      ...(prevCycles || []),
      {
        stockId: stockItem.id,
        name: stockItem.package.name,
        content: stockItem.package.content,
        use: stockItem.uses,
        clientId: stockItem.clientId,
      },
    ]);
  };

  const addMultiplePackages = async () => {
    setIsLoading(true);

    const aviableStock = await getAviableStock();

    if (quantityStock > aviableStock.length || quantityStock <= 0) {
      toast.warn(
        "Selecciona una cantidad entre 1 y " + aviableStock.length + " paquetes"
      );
      setIsLoading(false);
      return;
    }

    const addedStock = aviableStock.slice(0, quantityStock);

    const newCycles = addedStock.map((item) => {
      const { value } = item;
      return {
        stockId: value.id,
        name: value.package.name,
        content: value.package.content,
        use: value.uses,
        clientId: value.clientId,
      };
    });

    setCycles((preCycles) => [...(preCycles || []), ...newCycles]);
    setIsLoading(false);
  };

  const handleChangePackage = (e) => {
    setClientStock(e.value);
  };

  const handleChangeClient = (e) => {
    const clientId = e.value;

    const stockRef = collection(db, "stock");
    const q = query(
      stockRef,
      where("clientId", "==", clientId),
      where("status", "==", "Consultorio")
    );
    getDocs(q)
      .then((querySnapshot) => {
        const stockItems = querySnapshot.docs.map((doc) => doc.data());
        const filteredStockItems = stockItems.filter(
          (stockItem) => !cycles?.some((pkg) => pkg.id === stockItem.id)
        );
        const groupedPackages = filteredStockItems.reduce((acc, stockItem) => {
          const packageName = stockItem.package.name;
          if (!acc[packageName]) {
            acc[packageName] = {
              label: packageName,
              value: [],
            };
          }
          acc[packageName].value.push(stockItem);
          return acc;
        }, {});

        const clientPackages = Object.values(groupedPackages);
        setClientPackages(clientPackages);
      })
      .catch((error) => {
        console.error("Error fetching client stock: ", error);
      })
      .finally(() => {});
  };
  const handleChangeLoadInfo = async (e) => {
    if (!e.target) return;
    const { name, value } = e.target;
    const newData = { ...loadData, [name]: value };
    if (name === "date") newData.date = Timestamp.fromDate(new Date(value));
    if (name === "days") newData.days = parseInt(newData?.days || 1);
    if (name === "date" || name === "days")
      newData.exp = Timestamp.fromDate(
        addTimeToDate(newData.date?.toDate(), newData.days, "d")
      );
    await setLoadData(newData);
    if (name === "date" || name === "days") updateTimeLabels();
  };

  const updateTimeLabels = () => {
    if (
      !loadData?.date ||
      loadData?.route?.process.length === 0 ||
      !loadData?.route
    ) {
      return;
    }

    let startDate = loadData?.date?.toDate() || new Date();
    const route = loadData?.route || {};

    for (let i = 0; i < loadData.route.process.length; i++) {
      const processItem = loadData.route.process[i];
      const timeLabel = (date) => {
        return `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      };

      const endDate = addTimeToDate(
        startDate,
        processItem.values?.min || 1,
        "m"
      );

      const updatedItem = {
        ...processItem,
        timeLabel: `${timeLabel(startDate)} - ${timeLabel(endDate)}`,
      };
      startDate = addTimeToDate(endDate, 1, "m");
      route.process[i] = updatedItem;
    }

    setLoadData((prevLoadData) => ({
      ...prevLoadData,
      route,
    }));
  };

  const handleProcessChange = (index, value) => {
    const route = loadData.route;
    const processItem = route.process[index];
    processItem.values = { ...processItem.values, ...value };
    route.process[index] = processItem;
    setLoadData((prevLoadData) => ({
      ...prevLoadData,
      route,
    }));
    updateTimeLabels();
  };

  const createLoad = async () => {
    if (!loadData.date) {
      toast.warn("Selecciona una fecha válida");
      return;
    }

    if (!loadData.exp) {
      toast.warn("Selecciona un vencimiento válido");
      return;
    }

    if (loadData.date >= loadData.exp) {
      toast.warn("La fecha de vencimiento debe ser mayor a la fecha de inicio");
      return;
    }

    if (!loadData.route) {
      toast.warn("No hay ruta seleccionada");
      return;
    }

    await updateTimeLabels();

    setIsLoading(true);

    let processError = false;

    for (let i = 0; i < loadData.route.process.length; i++) {
      let processItem = loadData.route.process[i];
      let mainNotification =
        "El proceso #" + (i + 1) + " " + processItem.name + " requiere: ";
      let warnNotification = new String(mainNotification);
      if (
        processItem?.requirements?.min &&
        (!processItem?.values?.min || processItem?.values?.min === 0)
      ) {
        warnNotification += "una duración, ";
        processError = true;
      }

      if (
        processItem?.requirements?.psi &&
        (!processItem?.values?.psi || processItem?.values?.psi === 0)
      ) {
        warnNotification += "una presión, ";
        processError = true;
      }

      if (
        processItem?.requirements?.temp &&
        (!processItem?.values?.temp || processItem?.values?.temp === 0)
      ) {
        warnNotification += "una temperatura, ";
        processError = true;
      }

      if (
        processItem?.requirements?.supplies &&
        (!processItem?.values?.supplies || processItem?.values?.supplies === "")
      ) {
        warnNotification += "al menos un insumo, ";
        processError = true;
      }

      if (
        processItem?.requirements?.equipments &&
        (!processItem?.values?.equipments ||
          processItem?.values?.equipments === "")
      ) {
        warnNotification += "algún equipo, ";
        processError = true;
      }

      if (
        processItem?.requirements?.act &&
        (!processItem?.values?.act || processItem?.values?.act === "")
      ) {
        warnNotification += "alguna activación, ";
        processError = true;
      }
      if (warnNotification !== mainNotification) {
        toast.warn(warnNotification);
      }
    }

    if (!cycles || cycles?.length === 0) {
      toast.warn("No hay paquetes seleccionados");
      setIsLoading(false);
      return;
    }

    if (processError) {
      setIsLoading(false);
      return;
    }

    // Crear carga
    const toastId = toast.loading("Creando carga...");

    const lot = `${loadData.date
      .toDate()
      .getFullYear()
      .toString()}L${getDayOfYear(loadData.date.toDate())
      .toString()
      .padStart(3, "0")}`;

    const number =
      (await FireStore.getQuery("loads", "lot", "==", lot)).length + 1;

    const newLoad = {
      ...loadData,
      status: "En Curso",
      user: {
        id: currentUser.id,
        username: currentUser.username,
      },
      timestamp: new Date(),
      lot,
      number,
      id: `${lot}C${number.toString().padStart(2, "0")}`,
      cycles: {
        total: cycles.length,
        remaining: cycles.length,
      },
    };

    const existingLoad = await FireStore.get("loads", newLoad.id);
    if (existingLoad) {
      toast.update(toastId, {
        render: "Error al crear la carga: La carga ya existe, intenta de nuevo",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      await FireStore.save("loads", newLoad);
      toast.update(toastId, {
        render: "Creando Ciclos",
        isLoading: true,
      });

      cycles.forEach((cycle, index) => {
        //Update Stock
        const stockItem = {
          status: "Almacén",
          id: cycle.stockId,
          uses: cycle.use + 1,
        };
        FireStore.update("stock", stockItem);

        //Create Cycle
        cycle.number = index + 1;
        cycle.id = `${newLoad.id}P${cycle.number.toString().padStart(2, "0")}`;
        cycle.loadId = newLoad.id;
        FireStore.save("cycles", cycle);
      });
      setLoadData(newLoad);
      toast.update(toastId, {
        render: "Carga creada",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "No se pudo crear la carga",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error creating load: ", error);
    }
    setIsLoading(false);
  };

  const [confirmCancelationVisible, setConfirmCancelationVisible] =
    useState(false);

  const handleLabels = async () => {
    const newData = {
      ...loadData,
    };
    setIsLoading(true);
    if (!newData.labels) {
      const idToast = toast.loading("Creando etiquetas...");
      const labels = cycles.map((cycle) => {
        const clientItem = clients.find(
          (client) => client.id === cycle?.clientId
        );
        return {
          client: clientItem.prefix + clientItem.businessName,
          package: cycle.name,
          code: cycle.id,
          footer: `${formatDateHour(
            newData.date.toDate()
          )}   EXP:${dateToYYYYMMDD(newData.exp?.toDate())} Uso #${cycle.use}`,
        };
      });

      try {
        const url = await generateBarcodePDF(labels, newData.id);
        newData.labels = url;
        setLoadData(newData);
        FireStore.update("loads", newData);

        toast.update(idToast, {
          render: "Etiquetas creadas",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } catch (e) {
        toast.update(idToast, {
          render: "No se pudieron crear las etiquetas",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error(e);
        setIsLoading(false);
        return;
      }
    }
    window.open(newData.labels).focus();
    setIsLoading(false);
  };

  const getMenuIcon = (option) => {
    if (option.label === "Ruta") return <Route color="#292F36" size={20} />;
    if (option.label === "Paquetes")
      return <Package2Icon color="#292F36" size={20} />;
    if (option.label === "Controles")
      return <CircleCheckBig color="#292F36" size={20} />;
    if (option.label === "Cancelación") {
      return <CircleOff color="#292F36" size={20} />;
    }
  };

  const getAviableStock = () => {
    const usedStockIds = cycles?.map((cycle) => cycle.stockId) || [];
    const aviable = clientStock
      .filter((stockItem) => !usedStockIds.includes(stockItem.id))
      .map((stockItem) => ({
        value: stockItem,
        label: stockItem.id + " " + stockItem.package.name,
      }));
    return aviable;
  };

  const [newControl, setNewControl] = useState({});

  const handleControlInfoChange = (info) => {
    const newInfo = {
      ...newControl,
      ...info,
    };
    const startDate = newInfo?.startDate?.toDate() || new Date();
    const endDate = newInfo?.endDate?.toDate() || new Date();

    if (startDate > endDate) {
      newInfo.endDate = newInfo.startDate;
    }
    setNewControl(newInfo);
  };

  const getMethods = () => {
    return [
      {
        label: "Incubación de Microbiológico",
        value: "Incubación de 24 horas de un control microbiológico",
      },
      {
        label: "Control Clase V",
        value: "Control químico de temperatura y presión",
      },
      { label: "Test Bowie & Dick", value: "Test de penetración de vapor" },
    ];
  };

  const createControl = async () => {
    setIsLoading(true);
    console.log("control", newControl);
    if (!loadData.id) {
      toast.warn("No se puede crear el control, crea primero la carga");
      setIsLoading(false);
      return;
    }
    if (!newControl.startDate) {
      toast.warn(
        "No se puede crear el control, selecciona una fecha de inicio"
      );
      setIsLoading(false);
      return;
    }

    if (!newControl.endDate) {
      toast.warn(
        "No se puede crear el control, selecciona una fecha de finalización"
      );
      setIsLoading(false);
      return;
    }

    if (!newControl.method || newControl.method === "") {
      toast.warn("No se puede crear el control, Selecciona un método");
      setIsLoading(false);
      return;
    }

    if (!newControl.result || newControl.result === "") {
      toast.warn("No se puede crear el control, Escribe un resultado");
      setIsLoading(false);
      return;
    }

    if (!newControl.interpretation || newControl.interpretation === "") {
      toast.warn("No se puede crear el control, escribe una interpretación");
      setIsLoading(false);
      return;
    }

    if (!newControl.recomendations || newControl.recomendations === "") {
      toast.warn("No se puede crear el control, escribe una recomendación");
      setIsLoading(false);
      return;
    }

    if (!newControl?.attachments || newControl?.attachments?.length === 0) {
      toast.warn(
        "No se puede crear el control, adjunta al menos una evidencia"
      );
      setIsLoading(false);
      return;
    }

    const control = {
      ...newControl,
      user: {
        id: currentUser.id,
        username: currentUser.username,
      },
      timestamp: new Date(),
      attachments: [...(newControl?.attachments || [])],
    };

    const toastId = toast.loading("Agregando control...");

    if (control?.attachments?.length > 0) {
      toast.update(toastId, {
        render: "Subiendo archivos",
      });
    }

    // Upload Files
    const uploadPromises = control?.attachments?.map(async (file) => {
      return await FirebaseStorage.uploadFile(file, `${loadData.id}/controls`);
    });

    control.attachments = await Promise.all(uploadPromises);

    const newLoadData = {
      ...loadData,
      controls: [...(loadData?.controls || []), control],
      status: "Terminada",
    };

    try {
      await FireStore.update("loads", newLoadData);
      toast.update(toastId, {
        render: "Control Agregado",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      setNewControl({});
      setLoadData(newLoadData);
    } catch (error) {
      toast.update(toastId, {
        render: "No se pudo agregar el control",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error creating load: ", error);
    }
    setIsLoading(false);
  };

  const filteredMenuOptions = menuOptions.filter((option) => {
    if (loadData.status === "Sin Iniciar") {
      return option.label === "Paquetes" || option.label === "Ruta";
    }
    if (loadData.status === "En Curso" || loadData.status === "Terminada") {
      return (
        option.label === "Paquetes" ||
        option.label === "Ruta" ||
        option.label === "Controles"
      );
    }
    return true;
  });

  return (
    <div className="formContainer">
      <div className="loadForm">
        <div className="formHeader">
          <h3>{loadData?.id ? "Carga #" + loadData.id : "Nueva Carga"}</h3>
          <div className="buttonIconSection">
            {!loadData?.id ? (
              <BrandedButton
                isLoading={isLoading}
                label={"Crear Carga"}
                type="save"
                onClick={() => createLoad()}
              />
            ) : (
              !loadData.cancellation && (
                <>
                  <BrandedButton
                    label={"Cancelar Carga"}
                    type="cancel"
                    onClick={() => setConfirmCancelationVisible(true)}
                  />
                  <BrandedButton
                    isLoading={isLoading}
                    label={"Ver Rótulos"}
                    type="print"
                    onClick={() => handleLabels(true)}
                  />
                </>
              )
            )}

            <BrandedButton type="close" onClick={() => onClose()} />
          </div>
        </div>
        <div className="formRow">
          <div className="formItem short">
            <h5>Estado</h5>
            <span
              className={
                loadData.status === "Sin Iniciar"
                  ? "status-badge out"
                  : loadData.status === "En Curso"
                  ? "status-badge in"
                  : loadData.status === "Terminada"
                  ? "status-badge active"
                  : "status-badge inactive"
              }
            >
              {loadData.status}
            </span>
          </div>
          <div className="formItem">
            <h5>Fecha y Hora</h5>
            <input
              disabled={loadData.id}
              name="date"
              type="datetime-local"
              value={formatDateHour(loadData.date.toDate())}
              onChange={handleChangeLoadInfo}
            />
          </div>
          <div className="formItem">
            <h5>Dias</h5>
            {!loadData?.id ? (
              <input
                value={loadData?.days || 1}
                className="smallInput"
                type="number"
                min="1"
                name="days"
                onChange={handleChangeLoadInfo}
              ></input>
            ) : (
              <div
                className={
                  "expColor " + getExpColor(diffDays(loadData?.exp?.toDate()))
                }
              >
                {diffDays(loadData.exp?.toDate()) > 0
                  ? diffDays(loadData.exp?.toDate())
                  : "Vencido"}
              </div>
            )}
          </div>
          <div className="formItem">
            <h5>Vencimiento</h5>
            <label>
              {dateToDDMMYYYY(loadData?.exp?.toDate() || new Date())}
            </label>
          </div>
          <div className="formItem">
            <h5>Paquetes</h5>
            <p>
              {loadData?.id
                ? `${loadData.cycles.remaining}/${loadData.cycles.total}`
                : cycles.length}
            </p>
          </div>
          <div className="formItem long">
            <h5>Responsable</h5>
            <p>{loadData?.user?.username || currentUser.username}</p>
          </div>
        </div>
        {loadData?.cancellation && (
          <div className="formRow red">
            <div className="formItem">
              <h5>Fecha de Cancelación</h5>
              <p>
                {formatDateHour(loadData?.cancellation?.timestamp.toDate())}
              </p>
            </div>
            <div className="formItem">
              <h5>Responsable</h5>
              <p>{loadData?.cancellation?.user?.username}</p>
            </div>
            <div className="formItem">
              <h5>Motivo</h5>
              <p>{loadData?.cancellation?.type}</p>
            </div>
            <div className="formItem">
              <h5>Observaciones</h5>
              <p>{loadData?.cancellation?.comments}</p>
            </div>
          </div>
        )}
        <div className="formMenu">
          {filteredMenuOptions.map((option, index) => (
            <div
              className={
                "formMenuItem" + (option.isSelected ? " selected" : "")
              }
              onClick={() => handleSelectedMenu(option)}
              key={index}
            >
              {getMenuIcon(option)}
              {option.label}
            </div>
          ))}
        </div>
        <div className="formContent">
          {menuOptions[0].isSelected && (
            <>
              <div className="formRow">
                <div className="formItem">
                  <Select
                    isDisabled={loadData?.id}
                    className="selector"
                    options={routes?.map((route) => ({
                      value: route.id,
                      label: route?.name,
                    }))}
                    placeholder="Selecciona una ruta"
                    onChange={handleRouteChange}
                    value={
                      loadData?.route
                        ? {
                            value: loadData.route.id,
                            label: loadData.route.name,
                          }
                        : null
                    }
                  />
                </div>
              </div>
              <div className="formRow">
                <div className="formItem">
                  <h5>Descripción</h5>
                  <p>{loadData?.route?.content || "Selecciona una ruta"}</p>
                </div>
              </div>
              <div className="routeContent">
                {loadData?.route?.process?.map((processItem, index) => (
                  <div className="routeProcess" key={index}>
                    <div className="processItemColumn index">
                      <h1>{index + 1}</h1>
                    </div>

                    <div className="processItemColumn">
                      <div className="processItemRow">
                        <h4>{processItem?.name}</h4>
                        <h6 className="rightHeader">
                          {processItem?.timeLabel || "00:00 -> 00:00"}
                        </h6>
                      </div>
                      <div className="processItemRow">
                        {processItem?.requirements?.min && (
                          <div className="processField">
                            <h6>Duración</h6>
                            <input
                              value={processItem?.values?.min}
                              className="smallInput"
                              disabled={loadData?.id}
                              type="number"
                              min="1"
                              placeholder="Minutos"
                              name="min"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  [e.target.name]: parseInt(e.target.value),
                                })
                              }
                            ></input>
                          </div>
                        )}
                        {processItem?.requirements?.psi && (
                          <div className="processField">
                            <h6>Presión</h6>
                            <input
                              value={processItem?.values?.psi}
                              className="smallInput"
                              disabled={loadData?.id}
                              type="number"
                              min="1"
                              placeholder="PSI"
                              name="psi"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  [e.target.name]: parseInt(e.target.value),
                                })
                              }
                            ></input>
                          </div>
                        )}

                        {processItem?.requirements?.temp && (
                          <div className="processField">
                            <h6>Temperatura</h6>
                            <input
                              className="smallInput"
                              disabled={loadData?.id}
                              value={processItem?.values?.temp}
                              type="number"
                              min="1"
                              placeholder="°C"
                              name="temp"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  [e.target.name]: parseInt(e.target.value),
                                })
                              }
                            ></input>
                          </div>
                        )}

                        {processItem?.requirements?.supplies && (
                          <div className="processField">
                            <h6>Insumos</h6>
                            <input
                              type="text"
                              disabled={loadData?.id}
                              value={processItem?.values?.supplies}
                              placeholder="Códigos"
                              name="supplies"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  [e.target.name]: e.target.value,
                                })
                              }
                            ></input>
                          </div>
                        )}

                        {processItem?.requirements?.equipments && (
                          <div className="processField">
                            <h6>Equipo</h6>
                            <Select
                              className="selector"
                              isDisabled={loadData?.id}
                              value={
                                processItem?.values?.equipments && {
                                  value: processItem?.values?.equipments,
                                  label: equipments.find((equipment) => {
                                    return (
                                      equipment.id ===
                                      processItem?.values?.equipments
                                    );
                                  })?.name,
                                }
                              }
                              options={equipments?.map((equipment) => ({
                                value: equipment.id,
                                label: equipment.name,
                              }))}
                              placeholder="Selecciona"
                              name="equipments"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  equipments: e.value,
                                })
                              }
                            />
                          </div>
                        )}
                        {processItem?.requirements?.act && (
                          <div className="processField">
                            <h6>Activación</h6>
                            <Select
                              className="selector"
                              isDisabled={loadData?.id}
                              options={activations?.map((activation) => ({
                                value: activation.id,
                                label: dateToLongString(
                                  activation?.entry?.date?.toDate()
                                ),
                              }))}
                              value={
                                processItem?.values?.act && {
                                  value: processItem?.values?.act,
                                  label: dateToLongString(
                                    activations
                                      .find((activation) => {
                                        return (
                                          activation.id ===
                                          processItem?.values?.act
                                        );
                                      })
                                      ?.entry?.date?.toDate()
                                  ),
                                }
                              }
                              placeholder="Selecciona"
                              name="act"
                              onChange={(e) =>
                                handleProcessChange(index, {
                                  act: e.value,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="filler">.</div>
            </>
          )}
          {menuOptions[1].isSelected && (
            <>
              {!loadData?.id && (
                <>
                  <div className="formRow">
                    <div className="formItem">
                      <h5>Profesional</h5>
                      <Select
                        className="selector"
                        onChange={handleChangeClient}
                        options={clients?.map((client) => ({
                          value: client.id,
                          label: client.businessName,
                        }))}
                        placeholder="Selecciona..."
                      />
                    </div>
                    <div className="formItem">
                      <h5>Paquete</h5>
                      <Select
                        className="selector"
                        onChange={handleChangePackage}
                        options={clientPackages}
                        placeholder="Selecciona..."
                      />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formItem">
                      <Select
                        className="selector"
                        onChange={handleAddPackage}
                        options={getAviableStock()}
                        placeholder="Inventario"
                      />
                    </div>
                    <div className="formItem">
                      <input
                        className="smallInput"
                        type="number"
                        min="1"
                        max={getAviableStock().length}
                        name="quantityStock"
                        onChange={(e) =>
                          setQuantityStock(parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="formItem">
                      <BrandedButton
                        type="add"
                        label="Agregar paquetes"
                        onClick={addMultiplePackages}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="formTable">
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ciclo</th>
                        <th>Odontólogo</th>
                        <th>Paquete</th>
                        <th>Usos</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycles?.map((cycle, index) => {
                        const clientItem = clients.find(
                          (client) => client.id === cycle?.clientId
                        );
                        return (
                          <tr key={index}>
                            <td>{cycle?.id || index + 1}</td>
                            <td>{clientItem?.businessName}</td>
                            <td>{cycle.stockId + ": " + cycle?.name}</td>
                            <td>{cycle?.use}</td>
                            <td>
                              {!loadData?.id ? (
                                <span>
                                  <BrandedButton
                                    type="delete"
                                    onClick={() => handleRemovePackage(cycle)}
                                  />
                                </span>
                              ) : (
                                <span>
                                  {cycle?.exited ? (
                                    <CircleArrowOutUpRight
                                      size={20}
                                      color="#FF6B6B"
                                    />
                                  ) : (
                                    <Package2 size={20} color="#292F36" />
                                  )}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="filler">.</div>
              <div className="filler">.</div>
            </>
          )}
          {menuOptions[2].isSelected && (
            <>
              {!loadData.cancellation && (
                <>
                  <div className="formRow">
                    <div className="formItem">
                      <h5>Método</h5>
                      <Select
                        className="selector"
                        name="method"
                        onChange={(e) => {
                          handleControlInfoChange({
                            method: e.label,
                            description: e.value,
                          });
                        }}
                        options={getMethods()}
                        placeholder="Selecciona un Método"
                      />
                    </div>
                    <div className="formItem">
                      <h5>Descripción</h5>
                      <p>{newControl?.description || "Selecciona un método"}</p>
                    </div>
                    <div className="buttonIconSection">
                      <BrandedButton
                        isLoading={isLoading}
                        type="save"
                        onClick={() => createControl()}
                        label="Agregar Control"
                      />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formItem">
                      <h5>Fecha de Inicio</h5>
                      <input
                        value={formatDateHour(newControl?.startDate?.toDate())}
                        className="largeInput"
                        type="datetime-local"
                        name="startDate"
                        onChange={(e) =>
                          handleControlInfoChange({
                            startDate: Timestamp.fromDate(
                              new Date(e.target.value)
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="formItem">
                      <h5>Fecha de Finalización</h5>
                      <input
                        value={formatDateHour(newControl?.endDate?.toDate())}
                        className="largeInput"
                        type="datetime-local"
                        name="endDate"
                        onChange={(e) =>
                          handleControlInfoChange({
                            endDate: Timestamp.fromDate(
                              new Date(e.target.value)
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="formItem">
                      <h5>Resultado</h5>
                      <input
                        value={newControl?.result || ""}
                        className="largeInput"
                        type="text"
                        name="result"
                        onChange={(e) =>
                          handleControlInfoChange({
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="formItem">
                      <h5>Inventario</h5>
                      <input
                        value={newControl?.stock || ""}
                        className="largeInput"
                        type="text"
                        name="stock"
                        onChange={(e) =>
                          handleControlInfoChange({
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formItem long">
                      <h5>Interpretación</h5>
                      <input
                        value={newControl?.interpretation || ""}
                        className="largeInput"
                        type="text"
                        name="interpretation"
                        onChange={(e) =>
                          handleControlInfoChange({
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="formItem long">
                      <h5>Recomendaciones</h5>
                      <input
                        value={newControl?.recomendations || ""}
                        className="largeInput"
                        type="text"
                        name="recomendations"
                        onChange={(e) =>
                          handleControlInfoChange({
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="formItem">
                      <h5>Adjuntos</h5>
                      <FileSelector
                        onFilesSelected={(e) => {
                          newControl.attachments = e;
                        }}
                        inputFiles={newControl?.attachments}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="formTable">
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Método</th>
                        <th>Resultado</th>
                        <th>Adjuntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadData.controls?.map((control, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {formatDateHour(control?.startDate?.toDate())}
                            </td>
                            <td>{control.method}</td>
                            <td>{control.result}</td>
                            <td>
                              <FileViewer inputUrls={control.attachments} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {confirmCancelationVisible && (
        <CancelForm
          onSummit={(load) => setLoadData(load)}
          onClose={() => setConfirmCancelationVisible(false)}
          load={loadData}
        />
      )}
    </div>
  );
};

export default LoadForm;
