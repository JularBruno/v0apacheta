"use client"

import { useSyncExternalStore } from "react"
import { getInstallStatus, promptInstall, subscribeInstallState, type InstallStatus } from "@/lib/pwa/install-state"

export function useInstallApp(): { status: InstallStatus; install: () => Promise<boolean> } {
	const status = useSyncExternalStore(subscribeInstallState, getInstallStatus, () => "unsupported" as const)
	return { status, install: promptInstall }
}
