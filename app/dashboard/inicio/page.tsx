"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Gamepad2,
  Zap,
  Gift,
  Sparkles,
  Briefcase,
  Plane,
  DollarSign,
  CalendarDays,
} from "lucide-react"
import SpendingChart from "@/components/dashboard/spending-chart"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress" // Import Progress component
import QuickSpendCard, { type QuickSpendData } from "@/components/transactions/quick-spend-card"
//
import { getProfile } from "@/lib/actions/user";
import { useEffect, useState } from 'react';
import { User } from "@/lib/schemas/user"


interface Transaction {
  type: "gasto" | "ingreso"
  amount: number
  title: string
  category: string
  date: string
  time: string
}

interface PaymentItem {
  id: string
  name: string
  amount: number
  dueDate: string
}

export default function InicioPage() {
  // Mock data for budget summary and progress
  const monthlyBudget = 1000 // Example total budget
  const totalSpent = 200 // Example spent amount
  const monthlyBudgetRemaining = monthlyBudget - totalSpent
  const progressPercentage = (totalSpent / monthlyBudget) * 100


  // Mock data for upcoming payments
  const upcomingPayments: PaymentItem[] = [
    { id: "1", name: "Alquiler", amount: 500, dueDate: "01/mes" },
    { id: "2", name: "Internet", amount: 30, dueDate: "15/mes" },
    // { id: "3", name: {/* Mock data */}"Electricidad", amount: 70, dueDate: "20/mes" },
  ]

  // Calculate daily spending suggestion (mock for now, assuming 4 days remaining)
  const daysRemaining = 4 // This would be dynamic in a real app
  const dailySpendSuggestion = monthlyBudgetRemaining > 0 ? monthlyBudgetRemaining / daysRemaining : 0

  const handleTransactionComplete = (data: Transaction) => {
    console.log("Transaction completed:", data)
    alert("Transacción agregada exitosamente!")
    // In a real app, you would typically save the transaction to a global state or backend
  }

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUserProfile(profile);
        console.log('userProfile:', profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    // fetchProfile(); API DOESNT WORK
  }, []);

  return (
    <div className="space-y-6">
      {/* Budget Overview (existing small cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0 USD</div>
            <p className="text-sm text-gray-500">0 transacciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold mb-2">
                ${monthlyBudgetRemaining.toFixed(2)} restante de ${monthlyBudget.toFixed(2)}
              </div>
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1 jul</span> {/* Mock start date */}
                <span>{progressPercentage.toFixed(0)}%</span>
                <span>31 jul</span> {/* Mock end date */}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Puede gastar ${dailySpendSuggestion.toFixed(2)}/día para {daysRemaining} más días
              </p>
            </div>
          </CardContent>
        </Card>
        

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-sm text-gray-500">Balance actual</p>
          </CardContent>
        </Card> */}

      </div>
      
      <QuickSpendCard
        onAdd={(data: QuickSpendData) => {
          console.log("Quick spend:", data)
          alert(`${data.type === "ingreso" ? "Ingreso" : "Gasto"} • ${data.amount} • ${data.tagId}`)
          // TODO: push to your store/backend and refresh recent lists
          // ALSO: update balance
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses />
      </div>


      {/* Combined Financial Summary & Upcoming Payments Card AND Add Transaction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Combined Financial Summary & Upcoming Payments */}
        <Card>
          {/* <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-6">
            {/* Budget Progress Section */}
{/* 
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Presupuesto</h3>
                <span className="text-sm text-gray-500">Hoy</span>
              </div>
              <div className="text-2xl font-bold mb-2">
                ${monthlyBudgetRemaining.toFixed(2)} restante de ${monthlyBudget.toFixed(2)}
              </div>
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1 jul</span>
                <span>{progressPercentage.toFixed(0)}%</span>
                <span>31 jul</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Puede gastar ${dailySpendSuggestion.toFixed(2)}/día para {daysRemaining} más días
              </p>
            </div> */}


            {/* Separator between budget progress and net worth */}
            {/* Net Worth Summary Section */}
            {/* <Separator /> 
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Activos Totales</p>
                <p className="text-2xl font-bold text-green-600">${(1500 + 5000 + 200).toFixed(2)}</p> 
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Pasivos Totales</p>
                <p className="text-2xl font-bold text-red-600">-${(300 + 1200).toFixed(2)}</p> 
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Patrimonio Neto</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    1500 + 5000 + 200 - 300 - 1200 >= 0 ? "text-primary-600" : "text-red-600",
                  )}
                >
                  ${(1500 + 5000 + 200 - 300 - 1200).toFixed(2)}
                </p>
              </div>
            </div> */}

            <Separator /> {/* Separator between net worth and payments */}
            {/* Upcoming Payments Section */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Próximos Pagos
              </h3>
              <div className="space-y-3">
                {upcomingPayments.length > 0 ? (
                  upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{payment.name}</p>
                        <p className="text-sm text-gray-600">
                          ${payment.amount.toFixed(2)} • Vence: {payment.dueDate}
                        </p>
                      </div>
                      {/* Action button for payment, e.g., "Mark as Paid" */}
                      {/* <Button variant="outline" size="sm">Pagar</Button> */}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>¡Nada pendiente por pagar este mes!</p>
                    <p className="text-sm mt-1">Relájate, tu presupuesto está bajo control.</p>
                  </div>
                )}
              </div>
            </div>

          </CardContent>

        </Card>
      </div>

      {/* Bottom Section: Recent Expenses and Spending Chart (existing) */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses />
        <SpendingChart />
      </div> */}

    </div>
  )
}
