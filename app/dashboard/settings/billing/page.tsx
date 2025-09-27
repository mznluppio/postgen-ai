"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AuthPage from "@/app/auth/page";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { type BillingSettings, type InvoiceRecord, type PaymentMethodDetails } from "@/lib/auth";
import {
  PLAN_LABELS,
  type PlanId,
  PRICING_PLANS,
  getPlanSeatPolicy,
  getPlanSeatLimit,
} from "@/lib/plans";

const DEFAULT_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2024-03",
    label: "Mars 2024",
    amount: 29,
    currency: "EUR",
    status: "paid",
    issuedAt: new Date("2024-03-01").toISOString(),
    downloadUrl: "#",
  },
  {
    id: "INV-2024-02",
    label: "Février 2024",
    amount: 29,
    currency: "EUR",
    status: "paid",
    issuedAt: new Date("2024-02-01").toISOString(),
    downloadUrl: "#",
  },
  {
    id: "INV-2024-01",
    label: "Janvier 2024",
    amount: 0,
    currency: "EUR",
    status: "void",
    issuedAt: new Date("2024-01-01").toISOString(),
    downloadUrl: "#",
  },
];

const STATUS_LABELS: Record<InvoiceRecord["status"], string> = {
  paid: "Payée",
  due: "À régler",
  failed: "Échouée",
  void: "Annulée",
};

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function BillingSettingsPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const [billingEmail, setBillingEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("01");
  const [cardExpYear, setCardExpYear] = useState("2024");
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [savingBilling, setSavingBilling] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<PlanId | null>(null);
  const [seatAddonsInput, setSeatAddonsInput] = useState("0");
  const [savingSeats, setSavingSeats] = useState(false);
  const [seatSuccess, setSeatSuccess] = useState<string | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) {
      return;
    }

    const billing = currentOrganization.billing ?? {};
    setBillingEmail(billing.billingEmail ?? "");
    setCompanyName(billing.contact?.companyName ?? currentOrganization.name ?? "");
    setVatNumber(billing.contact?.vatNumber ?? "");
    setAddressLine1(billing.contact?.addressLine1 ?? "");
    setAddressLine2(billing.contact?.addressLine2 ?? "");
    setPostalCode(billing.contact?.postalCode ?? "");
    setCity(billing.contact?.city ?? "");
    setCountry(billing.contact?.country ?? "");
    setPurchaseOrder(billing.contact?.purchaseOrder ?? "");
    setSeatAddonsInput((billing.seatAddons?.quantity ?? 0).toString());

    if (billing.paymentMethod) {
      setCardBrand(billing.paymentMethod.brand);
      setCardLast4(billing.paymentMethod.last4);
      setCardExpMonth(billing.paymentMethod.expMonth.toString().padStart(2, "0"));
      setCardExpYear(billing.paymentMethod.expYear.toString());
    }
  }, [currentOrganization]);

  const invoices = useMemo(() => {
    if (!currentOrganization?.billing?.invoices || currentOrganization.billing.invoices.length === 0) {
      return DEFAULT_INVOICES;
    }

    return currentOrganization.billing.invoices;
  }, [currentOrganization]);

  const seatPolicy = useMemo(() => {
    if (!currentOrganization) {
      return null;
    }

    return getPlanSeatPolicy(currentOrganization.plan);
  }, [currentOrganization]);

  const activeMembers = currentOrganization?.members?.length ?? 0;
  const includedSeats = seatPolicy?.includedSeats ?? null;
  const additionalSeatsPurchased = currentOrganization?.billing?.seatAddons?.quantity ?? 0;
  const seatLimit = seatPolicy
    ? getPlanSeatLimit(currentOrganization.plan, additionalSeatsPurchased)
    : null;
  const additionalSeatsUsed = includedSeats === null ? 0 : Math.max(0, activeMembers - includedSeats);
  const seatsAvailable = seatLimit === null ? null : Math.max(0, seatLimit - activeMembers);
  const seatIntervalLabel = seatPolicy?.addOn?.interval === "yearly" ? "an" : "mois";
  const seatAddonEstimate = seatPolicy?.addOn?.pricePerSeat != null
    ? seatPolicy.addOn.pricePerSeat * (Number.parseInt(seatAddonsInput || "0", 10) || 0)
    : null;

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="flex min-h-[60vh] items-center justify-center p-6 text-muted-foreground">
          Chargement des paramètres de facturation...
        </div>
      </AuthGuard>
    );
  }

  const handleSaveBilling = async () => {
    setSavingBilling(true);
    setBillingSuccess(null);
    setBillingError(null);

    try {
      const nextBilling: BillingSettings = {
        ...currentOrganization.billing,
        billingEmail,
        contact: {
          ...currentOrganization.billing?.contact,
          companyName,
          vatNumber,
          addressLine1,
          addressLine2,
          postalCode,
          city,
          country,
          purchaseOrder,
        },
      };
      await updateCurrentOrganization({ billing: nextBilling });
      setBillingSuccess("Informations de facturation mises à jour.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'enregistrer les informations.";
      setBillingError(message);
    } finally {
      setSavingBilling(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    setSavingPayment(true);
    setPaymentSuccess(null);
    setPaymentError(null);

    try {
      const paymentMethod: PaymentMethodDetails = {
        brand: cardBrand,
        last4: cardLast4,
        expMonth: Number.parseInt(cardExpMonth, 10),
        expYear: Number.parseInt(cardExpYear, 10),
        isDefault: true,
      };

      const nextBilling: BillingSettings = {
        ...currentOrganization.billing,
        billingEmail,
        contact: {
          ...currentOrganization.billing?.contact,
          companyName,
        },
        paymentMethod,
      };

      await updateCurrentOrganization({ billing: nextBilling });
      setPaymentSuccess("Moyen de paiement enregistré.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'enregistrer le moyen de paiement.";
      setPaymentError(message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveSeatAddons = async () => {
    if (!currentOrganization) {
      return;
    }

    setSavingSeats(true);
    setSeatSuccess(null);
    setSeatError(null);

    try {
      if (!seatPolicy?.addOn) {
        throw new Error(
          "Les sièges additionnels ne sont pas disponibles pour ce plan.",
        );
      }

      const normalizedInput = seatAddonsInput.trim();
      const quantity = normalizedInput === ""
        ? 0
        : Number.parseInt(normalizedInput, 10);

      if (Number.isNaN(quantity) || quantity < 0) {
        throw new Error("Veuillez saisir un nombre de sièges additionnels valide.");
      }

      if (includedSeats !== null && quantity < additionalSeatsUsed) {
        throw new Error(
          `Vous utilisez actuellement ${additionalSeatsUsed} siège(s) additionnel(s). Réduisez les membres avant de diminuer le quota.`,
        );
      }

      const nextBilling: BillingSettings = {
        ...currentOrganization.billing,
        seatAddons: {
          quantity,
          currency: seatPolicy.addOn.currency,
          interval: seatPolicy.addOn.interval,
          pricePerSeat: seatPolicy.addOn.pricePerSeat,
          description: seatPolicy.addOn.description,
          updatedAt: new Date().toISOString(),
        },
      };

      await updateCurrentOrganization({ billing: nextBilling });
      setSeatAddonsInput(quantity.toString());
      setSeatSuccess("Nombre de sièges mis à jour.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour les sièges.";
      setSeatError(message);
    } finally {
      setSavingSeats(false);
    }
  };

  const handleSelectPlan = async (planId: PlanId) => {
    setUpdatingPlan(planId);
    setPlanSuccess(null);
    setPlanError(null);

    try {
      const renewal = new Date();
      renewal.setMonth(renewal.getMonth() + 1);

      const nextBilling: BillingSettings = {
        ...currentOrganization.billing,
        planRenewalDate: renewal.toISOString(),
      };

      await updateCurrentOrganization({ plan: planId, billing: nextBilling });
      setPlanSuccess(`Le plan ${PLAN_LABELS[planId]} est maintenant actif.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "La mise à jour du plan a échoué.";
      setPlanError(message);
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Abonnement & facturation</h1>
        <p className="text-sm text-muted-foreground">
          Consultez votre plan actuel, gérez vos informations de facturation et accédez à votre historique.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de facturation</CardTitle>
              <CardDescription>
                Les coordonnées figurant sur vos factures et documents comptables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billing-email">Email de facturation</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    value={billingEmail}
                    placeholder="facturation@exemple.com"
                    onChange={(event) => setBillingEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Raison sociale</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    placeholder="Nom de l'entreprise"
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vat-number">Numéro de TVA intracom.</Label>
                  <Input
                    id="vat-number"
                    value={vatNumber}
                    placeholder="FRXX999999999"
                    onChange={(event) => setVatNumber(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-order">Numéro de bon de commande</Label>
                  <Input
                    id="purchase-order"
                    value={purchaseOrder}
                    placeholder="PO-2024-001"
                    onChange={(event) => setPurchaseOrder(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address-line1">Adresse</Label>
                  <Input
                    id="address-line1"
                    value={addressLine1}
                    placeholder="12 rue des Lilas"
                    onChange={(event) => setAddressLine1(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-line2">Complément</Label>
                  <Input
                    id="address-line2"
                    value={addressLine2}
                    placeholder="Bâtiment B, étage 3"
                    onChange={(event) => setAddressLine2(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Code postal</Label>
                  <Input
                    id="postal-code"
                    value={postalCode}
                    placeholder="75010"
                    onChange={(event) => setPostalCode(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={city}
                    placeholder="Paris"
                    onChange={(event) => setCity(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={country}
                    placeholder="France"
                    onChange={(event) => setCountry(event.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Les changements s'appliqueront à la prochaine facture émise.
              </div>
              <div className="space-y-1 text-right">
                <Button onClick={handleSaveBilling} disabled={savingBilling}>
                  {savingBilling ? "Enregistrement..." : "Enregistrer"}
                </Button>
                {billingSuccess && <p className="text-xs text-green-600">{billingSuccess}</p>}
                {billingError && <p className="text-xs text-destructive">{billingError}</p>}
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moyen de paiement</CardTitle>
              <CardDescription>
                Enregistrez votre carte pour assurer la continuité du service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="card-brand">Type de carte</Label>
                  <Input
                    id="card-brand"
                    value={cardBrand}
                    placeholder="Visa, Mastercard..."
                    onChange={(event) => setCardBrand(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-last4">Quatre derniers chiffres</Label>
                  <Input
                    id="card-last4"
                    maxLength={4}
                    value={cardLast4}
                    placeholder="1234"
                    onChange={(event) => setCardLast4(event.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="card-exp-month">Mois d'expiration</Label>
                  <Input
                    id="card-exp-month"
                    maxLength={2}
                    value={cardExpMonth}
                    placeholder="08"
                    onChange={(event) => setCardExpMonth(event.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-exp-year">Année d'expiration</Label>
                  <Input
                    id="card-exp-year"
                    maxLength={4}
                    value={cardExpYear}
                    placeholder="2026"
                    onChange={(event) => setCardExpYear(event.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              </div>

              {currentOrganization.billing?.paymentMethod && (
                <div className="rounded-md border bg-muted/40 p-4 text-sm">
                  <p className="font-medium">Carte actuelle</p>
                  <p className="text-muted-foreground">
                    {currentOrganization.billing.paymentMethod.brand} se terminant par {" "}
                    {currentOrganization.billing.paymentMethod.last4} · expiration {" "}
                    {currentOrganization.billing.paymentMethod.expMonth.toString().padStart(2, "0")}/
                    {currentOrganization.billing.paymentMethod.expYear}
                  </p>
                </div>
              )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Les paiements sont sécurisés via notre prestataire Stripe.
            </div>
            <div className="space-y-1 text-right">
              <Button onClick={handleSavePaymentMethod} disabled={savingPayment}>
                {savingPayment ? "Enregistrement..." : "Mettre à jour"}
              </Button>
              {paymentSuccess && <p className="text-xs text-green-600">{paymentSuccess}</p>}
              {paymentError && <p className="text-xs text-destructive">{paymentError}</p>}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestion des sièges</CardTitle>
            <CardDescription>
              Ajustez le quota de membres inclus dans votre espace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Membres actifs</p>
                <p className="mt-1 text-2xl font-semibold">{activeMembers}</p>
              </div>
              <div className="rounded-md border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Sièges disponibles</p>
                <p className="mt-1 text-2xl font-semibold">
                  {seatLimit === null ? "Illimités" : seatsAvailable}
                </p>
              </div>
            </div>
            {includedSeats !== null && (
              <div className="rounded-md border border-dashed p-4 text-sm leading-relaxed">
                <p>
                  Pack de base : {includedSeats} siège(s) inclus
                  {seatPolicy?.addOn
                    ? ` · ${additionalSeatsPurchased} siège(s) additionnel(s)`
                    : ""}
                </p>
                {seatPolicy?.addOn?.pricePerSeat != null ? (
                  <p className="text-muted-foreground">
                    Siège supplémentaire : {formatter.format(seatPolicy.addOn.pricePerSeat)} / {seatIntervalLabel}
                  </p>
                ) : seatPolicy?.addOn?.description ? (
                  <p className="text-muted-foreground">{seatPolicy.addOn.description}</p>
                ) : null}
              </div>
            )}
            {seatPolicy?.addOn ? (
              <div className="space-y-2">
                <Label htmlFor="seat-addons">Sièges additionnels</Label>
                <Input
                  id="seat-addons"
                  type="number"
                  min={additionalSeatsUsed}
                  step={1}
                  value={seatAddonsInput}
                  onChange={(event) =>
                    setSeatAddonsInput(event.target.value.replace(/[^0-9]/g, ""))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {additionalSeatsUsed > 0
                    ? `Vous utilisez ${additionalSeatsUsed} siège(s) additionnel(s).`
                    : "Les sièges additionnels sont facturés uniquement au-delà du pack inclus."}
                </p>
                {seatAddonEstimate !== null && (
                  <p className="text-xs text-muted-foreground">
                    Estimation : {formatter.format(seatAddonEstimate)} / {seatIntervalLabel}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                Ajoutez davantage de membres en passant au plan Pro.
              </div>
            )}
          </CardContent>
          {seatPolicy?.addOn && (
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {seatPolicy.addOn.pricePerSeat != null
                  ? `Facturation supplémentaire : ${formatter.format(seatPolicy.addOn.pricePerSeat)} / siège / ${seatIntervalLabel}.`
                  : seatPolicy.addOn.description}
              </div>
              <div className="space-y-1 text-right">
                <Button onClick={handleSaveSeatAddons} disabled={savingSeats}>
                  {savingSeats ? "Enregistrement..." : "Mettre à jour"}
                </Button>
                {seatSuccess && <p className="text-xs text-green-600">{seatSuccess}</p>}
                {seatError && <p className="text-xs text-destructive">{seatError}</p>}
              </div>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des factures</CardTitle>
            <CardDescription>
                Téléchargez vos factures passées et vérifiez leur statut.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Émise le</TableHead>
                    <TableHead className="text-right">Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.label}</TableCell>
                      <TableCell>
                        {formatter.format(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "due"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {STATUS_LABELS[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.issuedAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" asChild>
                          <Link href={invoice.downloadUrl ?? "#"}>Télécharger</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan actuel</CardTitle>
              <CardDescription>
                Vous êtes sur le plan {PLAN_LABELS[currentOrganization.plan]}. Sélectionnez un autre plan pour changer d'offre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PRICING_PLANS.map((plan) => {
                  const isCurrent = plan.id === currentOrganization.plan;
                  const isLoading = updatingPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-lg border p-4 ${
                        isCurrent ? "border-primary/60 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold">{plan.name}</p>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                          {plan.highlight && <Badge variant="secondary">Populaire</Badge>}
                        </div>
                        <p className="text-lg font-semibold">{plan.price}</p>
                        <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                          {plan.perks.map((perk) => (
                            <li key={perk}>{perk}</li>
                          ))}
                        </ul>
                        {plan.seatSummary && (
                          <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs leading-relaxed">
                            <p className="font-medium text-foreground">{plan.seatSummary.included}</p>
                            {plan.seatSummary.additional && (
                              <p className="text-muted-foreground">{plan.seatSummary.additional}</p>
                            )}
                          </div>
                        )}
                        <Button
                          disabled={isCurrent || isLoading}
                          onClick={() => handleSelectPlan(plan.id as PlanId)}
                          variant={isCurrent ? "secondary" : "default"}
                        >
                          {isCurrent
                            ? "Plan actuel"
                            : isLoading
                            ? "Mise à jour..."
                            : `Choisir ${plan.name}`}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {planSuccess && <p className="text-sm text-green-600">{planSuccess}</p>}
              {planError && <p className="text-sm text-destructive">{planError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Renouvellement</CardTitle>
              <CardDescription>
                Votre abonnement se renouvellera automatiquement à la date indiquée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Prochaine échéance</span>
                <span className="font-medium">
                  {currentOrganization.billing?.planRenewalDate
                    ? new Date(currentOrganization.billing.planRenewalDate).toLocaleDateString("fr-FR")
                    : "Non défini"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline">Actif</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mode de paiement</span>
                <span>
                  {currentOrganization.billing?.paymentMethod
                    ? `${currentOrganization.billing.paymentMethod.brand} ·••${currentOrganization.billing.paymentMethod.last4}`
                    : "Aucun enregistré"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
