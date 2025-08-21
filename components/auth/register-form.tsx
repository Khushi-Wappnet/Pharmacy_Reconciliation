"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { authApi } from "@/lib/api"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pharmacyName: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        pharmacyName: formData.pharmacyName
      })

      if (response.success && response.data) {
        // localStorage.setItem("token", response.data.token)
        // localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", formData.email)
        localStorage.setItem("userName", formData.name)
        localStorage.setItem("pharmacyName", formData.pharmacyName)
        router.push("/")
        alert("Registration successful! Please log in.")
      } else {
        setError(response.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pharmacyName">Pharmacy Name</Label>
        <Input
          id="pharmacyName"
          name="pharmacyName"
          placeholder="Enter pharmacy name"
          value={formData.pharmacyName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  )
}