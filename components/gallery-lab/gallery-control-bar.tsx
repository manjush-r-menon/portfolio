"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { CONFIG } from "./gallery-config";

const islandTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1,
};

interface GallerySection {
  id: string;
  title: string;
}

interface GalleryControlBarProps {
  sections: GallerySection[];
  currentSectionIndex: number;
  onSwitch: (index: number) => void;
  setZoomTrigger: (target: "OUT" | number) => void;
  isZoomedIn: boolean;
  hasActiveSelection: boolean;
}

/**
 * Ported from the reference's GridUI.jsx (UnifiedControlBar), with the
 * e-commerce chrome removed: no type/color filter chips, no "Buy Now"
 * button — a focused tile's own close button is the only action needed.
 * The section tabs replace the Nike/New Balance/Under $150 collection
 * tabs 1:1 (same tab UI, same animation, different labels/data).
 */
export function UnifiedControlBar({
  sections,
  currentSectionIndex,
  onSwitch,
  setZoomTrigger,
  isZoomedIn,
  hasActiveSelection,
}: GalleryControlBarProps) {
  return (
    <div
      className="control-bar-container"
      style={{
        position: "fixed",
        bottom: "40px",
        left: "0",
        right: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <motion.div
        className="control-bar-island"
        layout
        transition={islandTransition}
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 240, 235, 0.4) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(245, 235, 255, 0.4) 100%)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          pointerEvents: "auto",
          height: "56px",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!hasActiveSelection && isZoomedIn && (
            <motion.div
              key="compact-mode"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ ...islandTransition, opacity: { duration: 0.2 } }}
              style={{ display: "flex" }}
            >
              <ControlButton
                icon="remove"
                onClick={() => setZoomTrigger("OUT")}
                label="Zoom Out"
              />
            </motion.div>
          )}
          {!hasActiveSelection && !isZoomedIn && (
            <motion.div
              key="expanded-mode"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              transition={{ ...islandTransition, opacity: { duration: 0.2 } }}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <ControlButton
                icon="add"
                onClick={() => setZoomTrigger(CONFIG.zoomIn)}
                label="Zoom In"
              />

              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "24px" }}
                transition={{ delay: 0.1 }}
                style={{
                  width: "1px",
                  background: "rgba(0,0,0,0.08)",
                  margin: "0 2px",
                  boxShadow: "0 0 1px rgba(255, 255, 255, 0.3)",
                }}
              />

              <div style={{ display: "flex", gap: "2px" }}>
                {sections.map((section, index) => {
                  const isActive = currentSectionIndex === index;
                  return (
                    <TabButton
                      key={section.id}
                      isActive={isActive}
                      onClick={() => onSwitch(index)}
                    >
                      {section.title}
                    </TabButton>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @media (max-height: 800px) {
          .control-bar-container {
            bottom: 24px !important;
          }
          .control-bar-island {
            height: 48px !important;
            border-radius: 24px !important;
            padding: 4px !important;
          }
        }
        @media (max-height: 650px) {
          .control-bar-container {
            bottom: 16px !important;
          }
          .control-bar-island {
            height: 44px !important;
          }
        }
        @media (max-width: 768px) {
          .control-bar-container {
            bottom: 20px !important;
          }
          .control-bar-island {
            height: 48px !important;
            padding: 4px !important;
          }
        }
        @media (max-width: 480px) {
          .control-bar-container {
            bottom: 16px !important;
          }
          .control-bar-island {
            height: 44px !important;
          }
          .control-button {
            width: 36px !important;
            height: 36px !important;
          }
          .tab-button {
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

function ControlButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: "add" | "remove";
  label: string;
}) {
  return (
    <motion.button
      layout="position"
      onClick={onClick}
      className="control-button"
      whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        color: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        outline: "none",
      }}
      aria-label={label}
    >
      {icon === "add" ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )}
    </motion.button>
  );
}

function TabButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className="tab-button"
      style={{
        position: "relative",
        border: "none",
        background: "transparent",
        color: isActive ? "#000" : "#666",
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        whiteSpace: "nowrap",
        zIndex: 1,
        transition: "color 0.2s ease",
      }}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          transition={islandTransition}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            zIndex: -1,
          }}
        />
      )}
    </motion.button>
  );
}
