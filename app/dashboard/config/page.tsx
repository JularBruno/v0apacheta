"use client"

import Link from "next/link"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function SettingsPage() {
  const [userName, setUserName] = useState("Usuario Apacheta")
  const [userEmail, setUserEmail] = useState("usuario@apacheta.com")
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    paymentReminders: true,
    mapUpdates: false,
    newsletters: true,
  })

  const handleSaveProfile = () => {
    alert("Profile saved!")
    // In a real app, you'd send this to a server action
  }

  const handleChangePassword = () => {
    alert("Redirecting to password change flow (not implemented yet).")
    // In a real app, you'd redirect to a dedicated password change page/modal
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deleted (simulated).")
      // In a real app, this would trigger a server action to delete the account
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userEmail} readOnly className="bg-gray-100 cursor-not-allowed" />
            <p className="text-sm text-gray-500 mt-1">El email no puede ser cambiado aquí.</p>
          </div>
          <Button onClick={handleSaveProfile}>Guardar Cambios</Button>
          <Separator className="my-4" />
          <h3 className="text-md font-semibold">Contraseña</h3>
          <p className="text-sm text-gray-600">Cambia tu contraseña para mantener tu cuenta segura.</p>
          <Button variant="outline" onClick={handleChangePassword}>
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="budget-alerts">Alertas de Presupuesto</Label>
            <Switch
              id="budget-alerts"
              checked={notifications.budgetAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, budgetAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="payment-reminders">Recordatorios de Pagos</Label>
            <Switch
              id="payment-reminders"
              checked={notifications.paymentReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="map-updates">Actualizaciones del Mapa</Label>
            <Switch
              id="map-updates"
              checked={notifications.mapUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, mapUpdates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="newsletters">Boletines y Novedades</Label>
            <Switch
              id="newsletters"
              checked={notifications.newsletters}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newsletters: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal & Disclaimers */}
      <Card>
        <CardHeader>
          <CardTitle>Legal y Disclaimers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              La información proporcionada en Apacheta es solo para fines educativos y no constituye asesoramiento
              financiero. Siempre consulta a un profesional antes de tomar decisiones de inversión.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="#" className="text-sm text-green-600 hover:underline">
              Términos de Servicio
            </Link>
            <Link href="#" className="text-sm text-green-600 hover:underline">
              Política de Privacidad
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Si deseas eliminar tu cuenta y todos tus datos, puedes hacerlo aquí. Esta acción es irreversible.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Eliminar Cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
