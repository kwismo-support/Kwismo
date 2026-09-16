import { useState, useEffect, useCallback } from 'react';
import { ussdApi } from '../services/ussd.api';
import type { CountryItem, OperatorItem, UssdActionItem, CountryIn, OperatorIn, UssdActionIn } from '../services/ussd.api';
import { toast } from '@/shared/store/toastStore';

export function useUssd() {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [ussdActions, setUssdActions] = useState<UssdActionItem[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const data = await ussdApi.getCountries();
      setCountries(data);
      if (data.length > 0 && !selectedCountryId) {
        const defaultCountry = data.find((c) => c.est_par_defaut) || data[0];
        setSelectedCountryId(defaultCountry.id);
      }
    } catch {
      toast.error('Erreur lors du chargement des pays');
    } finally {
      setLoadingCountries(false);
    }
  }, [selectedCountryId]);

  const fetchOperators = useCallback(async (countryId: string) => {
    if (!countryId) {
      setOperators([]);
      setSelectedOperatorId('');
      return;
    }
    setLoadingOperators(true);
    try {
      const data = await ussdApi.getOperators(countryId);
      setOperators(data);
      if (data.length > 0) {
        setSelectedOperatorId(data[0].id);
      } else {
        setSelectedOperatorId('');
      }
    } catch {
      toast.error('Erreur lors du chargement des opérateurs');
    } finally {
      setLoadingOperators(false);
    }
  }, []);

  const fetchActions = useCallback(async (operatorId: string) => {
    if (!operatorId) {
      setUssdActions([]);
      return;
    }
    setLoadingActions(true);
    try {
      const data = await ussdApi.getActions(operatorId);
      setUssdActions(data);
    } catch {
      toast.error('Erreur lors du chargement des actions USSD');
    } finally {
      setLoadingActions(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    if (selectedCountryId) {
      fetchOperators(selectedCountryId);
    }
  }, [selectedCountryId, fetchOperators]);

  useEffect(() => {
    if (selectedOperatorId) {
      fetchActions(selectedOperatorId);
    } else {
      setUssdActions([]);
    }
  }, [selectedOperatorId, fetchActions]);

  const handleCreateCountry = async (payload: CountryIn) => {
    try {
      const created = await ussdApi.createCountry(payload);
      toast.success('Pays créé avec succès');
      await fetchCountries();
      setSelectedCountryId(created.id);
      return true;
    } catch {
      toast.error('Erreur lors de la création du pays');
      return false;
    }
  };

  const handleUpdateCountry = async (id: string, payload: CountryIn) => {
    try {
      await ussdApi.updateCountry(id, payload);
      toast.success('Pays mis à jour');
      await fetchCountries();
      return true;
    } catch {
      toast.error('Erreur lors de la modification du pays');
      return false;
    }
  };

  const handleDeleteCountry = async (id: string) => {
    try {
      await ussdApi.deleteCountry(id);
      toast.success('Pays supprimé');
      if (selectedCountryId === id) {
        setSelectedCountryId('');
      }
      await fetchCountries();
      return true;
    } catch {
      toast.error('Erreur lors de la suppression du pays');
      return false;
    }
  };

  const handleCreateOperator = async (payload: OperatorIn) => {
    try {
      const created = await ussdApi.createOperator(payload);
      toast.success('Opérateur créé avec succès');
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      setSelectedOperatorId(created.id);
      return true;
    } catch {
      toast.error('Erreur lors de la création de l opérateur');
      return false;
    }
  };

  const handleUpdateOperator = async (id: string, payload: OperatorIn) => {
    try {
      await ussdApi.updateOperator(id, payload);
      toast.success('Opérateur mis à jour');
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de la modification de l opérateur');
      return false;
    }
  };

  const handleDeleteOperator = async (id: string) => {
    try {
      await ussdApi.deleteOperator(id);
      toast.success('Opérateur supprimé');
      if (selectedOperatorId === id) {
        setSelectedOperatorId('');
      }
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de la suppression de l opérateur');
      return false;
    }
  };

  const handleCreateAction = async (payload: UssdActionIn) => {
    try {
      await ussdApi.createAction(payload);
      toast.success('Action USSD créée avec succès');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de la création de l action USSD');
      return false;
    }
  };

  const handleUpdateAction = async (id: string, payload: UssdActionIn) => {
    try {
      await ussdApi.updateAction(id, payload);
      toast.success('Action USSD mise à jour');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de la modification de l action USSD');
      return false;
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await ussdApi.deleteAction(id);
      toast.success('Action USSD supprimée');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de la suppression de l action USSD');
      return false;
    }
  };

  return {
    countries,
    selectedCountryId,
    setSelectedCountryId,
    operators,
    selectedOperatorId,
    setSelectedOperatorId,
    ussdActions,
    loadingCountries,
    loadingOperators,
    loadingActions,
    fetchCountries,
    fetchOperators,
    fetchActions,
    createCountry: handleCreateCountry,
    updateCountry: handleUpdateCountry,
    deleteCountry: handleDeleteCountry,
    createOperator: handleCreateOperator,
    updateOperator: handleUpdateOperator,
    deleteOperator: handleDeleteOperator,
    createAction: handleCreateAction,
    updateAction: handleUpdateAction,
    deleteAction: handleDeleteAction,
  };
}
