import { HttpErrorResponse } from '@angular/common/http';

export function disbursementErrorMessage(error: HttpErrorResponse): string {
  const message = typeof error.error?.message === 'string' ? error.error.message : '';

  if (message === 'Total disbursed amount cannot exceed requested amount.') {
    return 'Le montant saisi dépasse le solde restant à décaisser.';
  }
  if (message === 'Insufficient treasury balance.') {
    return 'Solde insuffisant sur le compte choisi. Aucun décaissement n’a été enregistré.';
  }
  if (message.includes('Source account') || message.includes('treasury disbursement')) {
    return 'Compte source invalide ou incompatible avec le mode de paiement.';
  }
  if (error.status === 403) {
    return 'Seul un trésorier peut enregistrer un décaissement.';
  }
  if (error.status === 404) {
    return 'Cette dépense est introuvable. Actualisez la page.';
  }
  if (error.status === 409) {
    return 'Décaissement impossible : la dépense a changé. Actualisez la page et vérifiez son solde.';
  }
  return 'Décaissement impossible. Vérifiez les données saisies puis réessayez.';
}
