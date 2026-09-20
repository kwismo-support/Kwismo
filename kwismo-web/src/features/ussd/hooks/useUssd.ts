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
      toast.error('admin:ussd.toasts.fetchCountriesError');
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
      toast.error('admin:ussd.toasts.fetchOperatorsError');
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
      toast.error('admin:ussd.toasts.fetchActionsError');
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
      toast.success('admin:ussd.toasts.createCountrySuccess');
      await fetchCountries();
      setSelectedCountryId(created.id);
      return true;
    } catch {
      toast.error('admin:ussd.toasts.createCountryError');
      return false;
    }
  };

  const handleUpdateCountry = async (id: string, payload: CountryIn) => {
    try {
      await ussdApi.updateCountry(id, payload);
      toast.success('admin:ussd.toasts.updateCountrySuccess');
      await fetchCountries();
      return true;
    } catch {
      toast.error('admin:ussd.toasts.updateCountryError');
      return false;
    }
  };

  const handleDeleteCountry = async (id: string) => {
    try {
      await ussdApi.deleteCountry(id);
      toast.success('admin:ussd.toasts.deleteCountrySuccess');
      if (selectedCountryId === id) {
        setSelectedCountryId('');
      }
      await fetchCountries();
      return true;
    } catch {
      toast.error('admin:ussd.toasts.deleteCountryError');
      return false;
    }
  };

  const handleCreateOperator = async (payload: OperatorIn) => {
    try {
      const created = await ussdApi.createOperator(payload);
      toast.success('admin:ussd.toasts.createOperatorSuccess');
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      setSelectedOperatorId(created.id);
      return true;
    } catch {
      toast.error('admin:ussd.toasts.createOperatorError');
      return false;
    }
  };

  const handleUpdateOperator = async (id: string, payload: OperatorIn) => {
    try {
      await ussdApi.updateOperator(id, payload);
      toast.success('admin:ussd.toasts.updateOperatorSuccess');
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      return true;
    } catch {
      toast.error('admin:ussd.toasts.updateOperatorError');
      return false;
    }
  };

  const handleDeleteOperator = async (id: string) => {
    try {
      await ussdApi.deleteOperator(id);
      toast.success('admin:ussd.toasts.deleteOperatorSuccess');
      if (selectedOperatorId === id) {
        setSelectedOperatorId('');
      }
      if (selectedCountryId) {
        await fetchOperators(selectedCountryId);
      }
      return true;
    } catch {
      toast.error('admin:ussd.toasts.deleteOperatorError');
      return false;
    }
  };

  const handleCreateAction = async (payload: UssdActionIn) => {
    try {
      await ussdApi.createAction(payload);
      toast.success('admin:ussd.toasts.createActionSuccess');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('admin:ussd.toasts.createActionError');
      return false;
    }
  };

  const handleUpdateAction = async (id: string, payload: UssdActionIn) => {
    try {
      await ussdApi.updateAction(id, payload);
      toast.success('admin:ussd.toasts.updateActionSuccess');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('admin:ussd.toasts.updateActionError');
      return false;
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await ussdApi.deleteAction(id);
      toast.success('admin:ussd.toasts.deleteActionSuccess');
      if (selectedOperatorId) {
        await fetchActions(selectedOperatorId);
      }
      return true;
    } catch {
      toast.error('admin:ussd.toasts.deleteActionError');
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
