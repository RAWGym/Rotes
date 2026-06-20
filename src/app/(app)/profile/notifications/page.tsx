"use client";

import { useState } from "react";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

export default function NotificationsPage() {
  const [taskReminders, setTaskReminders] = useState(true);
  const [goalDeadlines, setGoalDeadlines] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [sound, setSound] = useState(true);

  return (
    <div className="p-6">
      <SubPageHeader title="Уведомления" />

      <div className="mt-6 flex flex-col gap-3">
        <ToggleSwitch checked={taskReminders} onChange={setTaskReminders} label="Напоминания о задачах" />
        <ToggleSwitch checked={goalDeadlines} onChange={setGoalDeadlines} label="Дедлайны целей" />
        <ToggleSwitch checked={weeklyDigest} onChange={setWeeklyDigest} label="Еженедельный дайджест" />
        <ToggleSwitch checked={sound} onChange={setSound} label="Звук уведомлений" />
      </div>

      <p className="mt-6 text-caption text-foreground/40">
        Реальная отправка push/email-уведомлений ещё не подключена — переключатели работают
        визуально.
      </p>
    </div>
  );
}
