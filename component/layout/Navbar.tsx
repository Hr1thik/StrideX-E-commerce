"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  User as UserIcon,
  ShoppingBag,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SearchModal from "./SearchModal";

const NAV_LINKS = [
  { label: "MEN", href: "/men" },
  { label: "WOMEN", href: "/women" },
  { label: "NEW ARRIVALS", href: "/products" },
  { label: "COLLECTIONS", href: "/collections" },
];

const SCROLL_THRESHOLD = 80;

// Mobile drawer-ile small links-inu common style
const DRAWER_LINK =
  "eyebrow text-(--color-ivory) transition-colors duration-300 hover:text-(--color-champagne)";

type UserData = {
  userId: string;
  email: string;
};

export default function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // CHECK LOGGED-IN USER

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // SCROLL EFFECT

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // PREVENT BODY SCROLL WHEN DRAWER OPEN

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // LOGOUT

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        setIsDrawerOpen(false);

        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* DESKTOP / MAIN NAVBAR*/}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
          isScrolled
            ? "border-(--color-stone-light) bg-(--color-ivory)/95 backdrop-blur-sm"
            : "border-transparent bg-(--color-ivory)"
        }`}
      >
        <div className="container-stridex flex h-16 items-center justify-between md:h-20">
          {/* LOGO */}
          <Link
            href="/"
            className="font-sans text-lg font-bold tracking-[0.2em] text-(--color-ink) md:text-xl"
          >
            STRIDE
            <span className="text-(--color-champagne)">X</span>
          </Link>

          {/* DESKTOP NAV LINKS*/}
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="eyebrow text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne)"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ICON CLUSTER*/}
          <div className="flex items-center gap-5 md:gap-6">
            {/* SEARCH */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne)"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) md:inline-flex"
            >
              <Heart size={19} strokeWidth={1.5} />
            </Link>

            {/* ACCOUNT */}
            {!isLoadingUser && (
              <>
                {user ? (
                  <>
                    {/* ACCOUNT */}
                    <Link
                      href="/account"
                      className="hidden items-center gap-2 text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:inline-flex"
                    >
                      <UserIcon size={19} strokeWidth={1.5} />
                      <span className="eyebrow">Account</span>
                    </Link>

                    {/* MY ORDERS */}
                    <Link
                      href="/orders"
                      className="hidden items-center gap-2 text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:inline-flex"
                    >
                      <span className="eyebrow">My Orders</span>
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="hidden items-center gap-2 text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:inline-flex"
                    >
                      <LogOut size={18} strokeWidth={1.5} />
                      <span className="eyebrow">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* LOGIN */}
                    <Link
                      href="/login"
                      className="hidden items-center gap-2 text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:inline-flex"
                    >
                      <UserIcon size={19} strokeWidth={1.5} />
                      <span className="eyebrow">Login</span>
                    </Link>

                    {/* REGISTER */}
                    <Link
                      href="/register"
                      className="hidden text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:inline-flex"
                    >
                      <span className="eyebrow">Register</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {/* SHOPPING BAG */}
            <Link
              href="/cart"
              aria-label={`Bag, ${cartCount} items`}
              className="relative text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne)"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-(--color-champagne) text-[10px] font-semibold text-(--color-ink)">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* MOBILE MENU */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsDrawerOpen(true)}
              className="text-(--color-ink) transition-colors duration-300 hover:text-(--color-champagne) lg:hidden"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER*/}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        isLoadingUser={isLoadingUser}
        onLogout={handleLogout}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

/* MOBILE DRAWER */

function MobileDrawer({
  isOpen,
  onClose,
  user,
  isLoadingUser,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  isLoadingUser: boolean;
  onLogout: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-60 flex flex-col bg-(--color-ink)"
        >
          {/* DRAWER HEADER */}
          <div className="container-stridex flex h-16 items-center justify-between md:h-20">
            <span className="font-sans text-lg font-bold tracking-[0.2em] text-(--color-ivory)">
              STRIDEX
            </span>

            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="text-(--color-ivory) transition-colors duration-300 hover:text-(--color-champagne)"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* MOBILE NAV LINKS*/}
          <motion.nav
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: 0.1,
                },
              },
              closed: {},
            }}
            className="container-stridex flex flex-1 flex-col justify-center gap-2"
          >
            {NAV_LINKS.map((link) => (
              <motion.div
                key={link.href}
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                  },
                  closed: {
                    opacity: 0,
                    y: 16,
                  },
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="display-headline block py-3 text-4xl text-(--color-ivory) transition-colors duration-300 hover:text-(--color-champagne)"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* ACCOUNT SECTION */}
          <div className="container-stridex flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[rgb(255_255_255/0.12)] py-6">
            {isLoadingUser ? (
              <span className="eyebrow text-(--color-ivory)/60">
                Loading...
              </span>
            ) : user ? (
              <>
                {/* ACCOUNT */}
                <Link href="/account" onClick={onClose} className={DRAWER_LINK}>
                  Account
                </Link>

                {/* MY ORDERS */}
                <Link href="/orders" onClick={onClose} className={DRAWER_LINK}>
                  My Orders
                </Link>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={onLogout}
                  className={`flex items-center gap-2 ${DRAWER_LINK}`}
                >
                  <LogOut size={15} strokeWidth={1.5} />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* LOGIN */}
                <Link href="/login" onClick={onClose} className={DRAWER_LINK}>
                  Login
                </Link>

                {/* REGISTER */}
                <Link
                  href="/register"
                  onClick={onClose}
                  className={DRAWER_LINK}
                >
                  Register
                </Link>
              </>
            )}

            {/* WISHLIST */}
            <Link href="/wishlist" onClick={onClose} className={DRAWER_LINK}>
              Wishlist
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}