<script lang="ts">
  import { steps } from '$lib/data/quiz';
  import VideoStep from '$lib/components/VideoBlock.svelte';
  import MultipleChoice from '$lib/components/MultipleChoice.svelte';
  import MultipleChoiceImage from '$lib/components/MultipleChoiceImage.svelte';
  import TrueFalseQuestion from '$lib/components/TrueFalseQuestion.svelte';
  import SliderQuestion from '$lib/components/SliderQuestion.svelte';
  import HotspotQuestion from '$lib/components/HotspotQuestion.svelte';
  import FinishScreen from '$lib/components/FinishScreen.svelte';

  // Kun reelle spørsmål for teller/progress
  const questionSteps = $derived(
    steps.filter(
      (s) =>
        s.type === 'mcq' ||
        s.type === 'mcq-image' ||
        s.type === 'truefalse' ||
        s.type === 'slider' ||
        s.type === 'hotspot'
    )
  );
  const totalQuestions = $derived(questionSteps.length);

  // si = lineær indeks gjennom ALLE steg (inkl. video)
  // qi = indeks for KUN spørsmål (brukes til "spørsmål X av Y")
  let si = $state(0);
  let qi = $state(0);
  let totalScore = $state(0);
  let correctCount = $state(0); // 👈 NY: antall riktige

  const currentStep = $derived(si < steps.length ? steps[si] : null);

  // Når et spørsmål er ferdig
  function handleQuestionDone(res: {
    correct: boolean;
    score: number;
    elapsed: number;
    choice: string | null;
    timedOut: boolean;
  }) {
    totalScore += res.score;
    if (res.correct) {
      correctCount += 1; // 👈 øk ved riktig svar
    }
    qi += 1; // neste spørsmål i telleren
    si += 1; // neste steg totalt
  }

  // Når video er ferdig (eller "hopp over")
  function handleVideoDone() {
    si += 1;
  }

  // Når quizen er ferdig: lagre til localStorage (til resultatside / leaderboard)
  $effect(() => {
    if (!currentStep && typeof localStorage !== 'undefined') {
      localStorage.setItem('checkpoint_score', String(totalScore));
      localStorage.setItem('checkpoint_correct', String(correctCount));
      localStorage.setItem('checkpoint_total', String(totalQuestions));
    }
  });
</script>

{#if currentStep}
  {#key currentStep.id}
    {#if currentStep.type === 'video'}
      <VideoStep
        src={currentStep.src}
        autoplay={currentStep.autoplay}
        onDone={handleVideoDone}
      />

    {:else if currentStep.type === 'mcq'}
      <MultipleChoice
        text={currentStep.text}
        options={currentStep.options}
        correct={currentStep.correct}
        random={currentStep.random}
        maxTime={currentStep.maxTime}
        maxPoint={currentStep.maxPoint}
        minPoint={currentStep.minPoint}
        index={qi + 1}
        total={totalQuestions}
        totalScore={totalScore}
        onDone={handleQuestionDone}
      />

    {:else if currentStep.type === 'mcq-image'}
      <MultipleChoiceImage
        text={currentStep.text}
        options={currentStep.options}
        correct={currentStep.correct}
        random={currentStep.random}
        maxTime={currentStep.maxTime}
        maxPoint={currentStep.maxPoint}
        minPoint={currentStep.minPoint}
        index={qi + 1}
        total={totalQuestions}
        totalScore={totalScore}
        imageBasePath={currentStep.imagePath ?? '/images/quiz/'}
        onDone={handleQuestionDone}
      />

    {:else if currentStep.type === 'truefalse'}
      <TrueFalseQuestion
        text={currentStep.text}
        options={currentStep.options}
        correct={currentStep.correct}
        maxTime={currentStep.maxTime}
        maxPoint={currentStep.maxPoint ?? 100}
        minPoint={currentStep.minPoint ?? 50}
        index={qi + 1}
        total={totalQuestions}
        totalScore={totalScore}
        onDone={handleQuestionDone}
      />

    {:else if currentStep.type === 'slider'}
      <SliderQuestion
        text={currentStep.text}
        min={currentStep.min}
        max={currentStep.max}
        start={currentStep.start}
        correct={currentStep.correct}
        scoreRange={currentStep.scoreRange}
        prefix={currentStep.prefix}
        step={currentStep.step ?? 1}
        maxTime={currentStep.maxTime}
        maxPoint={currentStep.maxPoint ?? 100}
        index={qi + 1}
        total={totalQuestions}
        totalScore={totalScore}
        onDone={handleQuestionDone}
      />

    {:else if currentStep.type === 'hotspot'}
      <HotspotQuestion
        text={currentStep.text}
        image={currentStep.image}
        pin={currentStep.pin}
        correct={currentStep.correct}
        maxTime={currentStep.maxTime}
        maxPoint={currentStep.maxPoint ?? 100}
        index={qi + 1}
        total={totalQuestions}
        totalScore={totalScore}
        onDone={handleQuestionDone}
      />
    {/if}
  {/key}
{:else}

  <FinishScreen
    finalScore={totalScore}
    correctCount={correctCount}
    totalQuestions={totalQuestions}
  />
{/if}
