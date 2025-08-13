"use client"

import { useState, useEffect } from "react"
import { WalletService, Wallet } from "@/services/wallet-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon } from "lucide-react"
import Link from "next/link"

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await WalletService.getWallets()
      setWallets(data)
    } catch (err: any) {
      setError("Ошибка при загрузке кошельков: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот кошелек?")) {
      try {
        await WalletService.deleteWallet(id)
        setWallets(wallets.filter(wallet => wallet.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении кошелька: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Кошельки</h1>
        <Link href="/wallets/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый кошелек
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка кошельков...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.length > 0 ? (
            wallets.map(wallet => (
              <Card key={wallet.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{wallet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{wallet.description || "Нет описания"}</p>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/50 p-4">
                  <Link href={`/wallets/${wallet.id}`}>
                    <Button variant="outline" size="sm">
                      Просмотр
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/wallets/${wallet.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(wallet.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">У вас еще нет кошельков</p>
              <Link href="/wallets/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый кошелек
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
