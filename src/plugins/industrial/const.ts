export const INDUSTRIAL_STATE_TOPIC = 'brewcast/state';

export const STATUS_COLORS: Record<string, string> = {
  OK: 'positive',
  NORMAL: 'positive',
  VIDE_TUYAU: 'warning',
  ALARME_HAUTE: 'negative',
  ALARME_BASSE: 'warning',
  ALARME_DEBIT: 'negative',
  HORS_PLAGE: 'negative',
  ERREUR_COM: 'negative',
  PLEIN: 'info',
  VIDE: 'warning',
};

export const STATUS_LABELS: Record<string, string> = {
  OK: 'OK',
  NORMAL: 'Normal',
  VIDE_TUYAU: 'Vide tuyau',
  ALARME_HAUTE: 'Alarme haute',
  ALARME_BASSE: 'Alarme basse',
  ALARME_DEBIT: 'Alarme débit',
  HORS_PLAGE: 'Hors plage',
  ERREUR_COM: 'Erreur com',
  PLEIN: 'Plein',
  VIDE: 'Vide',
};
