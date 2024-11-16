import { createContext } from 'react'
import { type UserIdentityData } from '~/supabase/getUserIdentity'

type NavbarContext = {
	userIdentity: UserIdentityData
	campaignCount: number
	characterCount: number
}

export const NavbarContext = createContext<NavbarContext>({
	userIdentity: null,
	campaignCount: 0,
	characterCount: 0
})
